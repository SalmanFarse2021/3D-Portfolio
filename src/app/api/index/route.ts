import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData, getRepoTree, getFileContent } from '@/lib/github';
import { selectFilesToIndex } from '@/lib/repoSelector';
import { chunkFile } from '@/lib/chunking';
import { generateEmbeddings } from '@/lib/embeddings';
import { upsertChunks, Document } from '@/lib/vectorStore';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

// Prevent vercel timeouts if possible (limit execution time or batches)
export const maxDuration = 300; // 5 minutes (requires Pro plan usually, check Vercel docs)

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = checkRateLimit(`index-${ip}`, { limit: 5, window: 60 * 60 * 1000 }); // 5 per hour
    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Check for simple admin secret (could be env var or simple basic auth)
    // For demo: verify a custom header 'x-admin-key' matches OPENAI_API_KEY (just as a secret placeholder)
    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== env.OPENAI_API_KEY) {
        // Using OPENAI_KEY as simple secret for now, ideally dedicated secret
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        logger.info('Starting indexing...', { adminKey: 'REDACTED' });
        const ghData = await fetchGitHubData();
        if (!ghData) {
            return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
        }

        let totalFiles = 0;
        let totalChunks = 0;

        for (const repo of ghData.repositories) {
            logger.info(`Processing repo: ${repo.name}`);
            const tree = await getRepoTree(ghData.profile.login, repo.name, repo.default_branch);
            const selectedFiles = selectFilesToIndex(tree);

            logger.info(`Selected ${selectedFiles.length} files from ${repo.name}`);

            for (const file of selectedFiles) {
                const content = await getFileContent(ghData.profile.login, repo.name, file.path);
                if (!content) continue;

                // Create full URL to file
                const fileUrl = `${repo.html_url}/blob/${repo.default_branch}/${file.path}`;

                // Chunking
                const chunks = chunkFile(repo.name, file.path, content, file.type);
                if (chunks.length === 0) continue;

                // Embeddings
                const texts = chunks.map(c => c.content);
                const vectors = await generateEmbeddings(texts); // Batch call

                if (!vectors || vectors.length !== chunks.length) {
                    logger.error(`Failed to generate embeddings for ${file.path}`);
                    continue;
                }

                // Prepare for Upsert
                const docs: Document[] = chunks.map((chunk, i) => ({
                    content: chunk.content,
                    embedding: vectors[i],
                    repo: repo.name,
                    path: file.path,
                    url: fileUrl,
                    type: file.type,
                    chunk_index: chunk.index,
                }));

                const { error } = await upsertChunks(docs);
                if (error) {
                    logger.error(`Upsert failed for ${file.path}:`, error);
                } else {
                    totalFiles++;
                    totalChunks += chunks.length;
                }
            }
        }

        return NextResponse.json({
            success: true,
            stats: {
                repos: ghData.repositories.length,
                files: totalFiles,
                chunks: totalChunks
            }
        });

    } catch (error: any) {
        logger.error('Indexing failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
