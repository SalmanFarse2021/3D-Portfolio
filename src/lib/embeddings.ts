import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * Generate embeddings for a batch of text chunks
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][] | null> {
    if (!openai) {
        console.error('OpenAI client not initialized (missing key)');
        return null;
    }

    try {
        // Handle rate limits / batching if texts > 50 roughly
        // For simplicity, assuming caller handles reasonably sized batches
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: texts,
        });

        return response.data.map(item => item.embedding);
    } catch (error) {
        console.error('Error generating embeddings:', error);
        return null;
    }
}
