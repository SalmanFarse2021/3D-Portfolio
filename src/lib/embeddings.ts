import OpenAI from 'openai';
import { withCache } from './cache';

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Simple string hash for cache keys
function hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

/**
 * Generate embeddings for a batch of text chunks
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][] | null> {
    if (!openai) {
        console.error('OpenAI client not initialized (missing key)');
        return null;
    }

    try {
        // Create a unique cache key for this batch
        const combinedHash = texts.map(hashText).join('-');
        const cacheKey = `embeddings-batch-${combinedHash}`;

        return withCache(cacheKey, async () => {
            const response = await openai!.embeddings.create({
                model: 'text-embedding-3-small',
                input: texts,
            });
            return response.data.map(item => item.embedding);
        });

    } catch (error) {
        console.error('Error generating embeddings:', error);
        return null;
    }
}

