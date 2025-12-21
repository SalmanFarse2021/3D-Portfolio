import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VECTOR_DB_URL;
const supabaseKey = process.env.VECTOR_DB_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export interface Document {
    id?: string;
    content: string;
    embedding: number[];
    repo: string;
    path: string;
    url: string;
    type: string;
    chunk_index: number;
    created_at?: string;
}

/**
 * Upsert document chunks into Supabase
 */
export async function upsertChunks(chunks: Document[]): Promise<{ error: any }> {
    if (!supabase) {
        return { error: 'Supabase client not initialized' };
    }

    try {
        const { error } = await supabase
            .from('documents')
            .upsert(chunks, { onConflict: 'repo,path,chunk_index' as any }); // Requires composite unique constraint

        if (error) {
            console.error('Supabase upsert error:', error);
            return { error };
        }
        return { error: null };
    } catch (e) {
        console.error('Unexpected error upserting chunks:', e);
        return { error: e };
    }
}

/**
 * Search for similar documents using pgvector
 */
export async function searchSimilar(embedding: number[], topK: number = 5, filterRepo?: string) {
    if (!supabase) return [];

    try {
        // Calls the RPC function 'match_documents'
        // SQL:
        // create or replace function match_documents (
        //   query_embedding vector(1536),
        //   match_threshold float,
        //   match_count int,
        //   filter_repo text default null
        // )
        // ...

        const params: any = {
            query_embedding: embedding,
            match_threshold: 0.5, // minimum similarity
            match_count: topK,
        };

        if (filterRepo) {
            params.filter_repo = filterRepo;
        }

        const { data, error } = await supabase.rpc('match_documents', params);

        if (error) {
            console.error('Supabase search error:', error);
            return [];
        }

        return data;
    } catch (e) {
        console.error('Unexpected error searching chunks:', e);
        return [];
    }
}
