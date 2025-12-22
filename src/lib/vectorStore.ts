import clientPromise from '@/lib/mongodb';

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

const DB_NAME = '3d_portfolio'; // Or whatever DB name they prefer, defaulting to this
const COLLECTION_NAME = 'code_embeddings';

/**
 * Upsert document chunks into MongoDB
 */
export async function upsertChunks(chunks: Document[]): Promise<{ error: any }> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Batch upsert? MongoDB doesn't have a direct "upsert many" with unique keys easily in one go 
        // without bulkWrite.
        // We want to dedup based on (repo, path, chunk_index).

        const operations = chunks.map(chunk => ({
            updateOne: {
                filter: {
                    repo: chunk.repo,
                    path: chunk.path,
                    chunk_index: chunk.chunk_index
                },
                update: {
                    $set: {
                        content: chunk.content,
                        embedding: chunk.embedding,
                        url: chunk.url,
                        type: chunk.type,
                        updated_at: new Date()
                    },
                    $setOnInsert: { created_at: new Date() }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await collection.bulkWrite(operations);
        }

        return { error: null };
    } catch (e) {
        console.error('MongoDB upsert error:', e);
        return { error: e };
    }
}

/**
 * Search for similar documents using MongoDB Vector Search
 */
export async function searchSimilar(embedding: number[], topK: number = 5, filterRepo?: string) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Atlas Vector Search Aggregation
        // Requires an index named "vector_index" (default) or specified
        const pipeline: any[] = [
            {
                $vectorSearch: {
                    index: "vector_index", // User must create this in Atlas
                    path: "embedding",
                    queryVector: embedding,
                    numCandidates: topK * 10, // heuristic
                    limit: topK
                }
            }
        ];

        // Optional filter
        // Note: For $vectorSearch, pre-filtering is done inside the $vectorSearch stage using 'filter' 
        // but simple $match after is also possible for small datasets, though less efficient.
        // Atlas Search supports strict filtering inside.
        if (filterRepo) {
            pipeline[0].$vectorSearch.filter = {
                repo: { $eq: filterRepo }
            };
        }

        const projectStage = {
            $project: {
                _id: 0,
                content: 1,
                repo: 1,
                path: 1,
                url: 1,
                type: 1,
                score: { $meta: "vectorSearchScore" }
            }
        };

        pipeline.push(projectStage);

        const results = await collection.aggregate(pipeline).toArray();
        return results;

    } catch (e) {
        console.error('MongoDB vector search error:', e);
        return [];
    }
}

/*
 * INDEX CREATION INSTRUCTIONS (For User):
 * 
 * Navigate to MongoDB Atlas -> Database -> "3d_portfolio" -> "code_embeddings" -> Indexes -> Create Search Index
 * Select "JSON Editor" and use this configuration:
 * 
 * {
 *   "fields": [
 *     {
 *       "numDimensions": 1536,
 *       "path": "embedding",
 *       "similarity": "cosine",
 *       "type": "vector"
 *     },
 *     {
 *       "path": "repo",
 *       "type": "filter"
 *     }
 *   ]
 * }
 */
