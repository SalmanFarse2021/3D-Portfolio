import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import { REPOS_TO_INGEST } from '../src/config/repos';

// Manually verify imports or copy utils if they rely on "window" or browser APIs
// assuming src/lib/chunking.ts is pure JS/TS without browser deps.
import { chunkFile, Chunk } from '../src/lib/chunking';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!MONGO_URI || !OPENAI_KEY) {
    console.error("Missing MONGODB_URI or OPENAI_API_KEY");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });
const client = new MongoClient(MONGO_URI);
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// --- Helpers ---

async function getEmbedding(text: string) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
    } catch (e) {
        console.error("Embedding error:", e);
        return null;
    }
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            mediaType: { format: 'raw' }
        });
        return response.data as unknown as string;
    } catch (e: any) {
        if (e.status !== 404) console.warn(`Failed to fetch ${owner}/${repo}/${path}: ${e.message}`);
        return null;
    }
}

async function getRepoDetails(owner: string, repo: string) {
    try {
        const { data } = await octokit.rest.repos.get({ owner, repo });
        return data; // description, language, hp
    } catch (e) {
        console.error(`Repo fetch error ${owner}/${repo}`, e);
        return null;
    }
}

// --- Main ---

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('3d_portfolio');
        const collection = db.collection('code_embeddings');

        for (const repoConfig of REPOS_TO_INGEST) {
            console.log(`Processing Repo: ${repoConfig.owner}/${repoConfig.repo}...`);

            // 1. Fetch Repo Metadata
            const details = await getRepoDetails(repoConfig.owner, repoConfig.repo);
            if (!details) continue;

            const repoMetaContent = `
Repository: ${repoConfig.owner}/${repoConfig.repo}
Description: ${details.description}
Language: ${details.language}
Stars: ${details.stargazers_count}
Main Branch: ${repoConfig.branch}
URL: ${details.html_url}
            `.trim();

            const metaEmbedding = await getEmbedding(repoMetaContent);
            if (metaEmbedding) {
                await collection.updateOne(
                    { repo: repoConfig.repo, path: 'ROOT', type: 'repo_meta' },
                    {
                        $set: {
                            content: repoMetaContent,
                            embedding: metaEmbedding,
                            repo: repoConfig.repo,
                            path: 'ROOT',
                            url: details.html_url,
                            type: 'repo_meta',
                            chunk_index: 0,
                            updated_at: new Date()
                        },
                        $setOnInsert: { created_at: new Date() }
                    },
                    { upsert: true }
                );
            }

            // 2. Fetch specific files
            for (const filePath of repoConfig.files) {
                console.log(`  Fetching ${filePath}...`);
                const content = await fetchFileContent(repoConfig.owner, repoConfig.repo, filePath);
                if (content) {
                    const chunks = chunkFile(repoConfig.repo, filePath, content, 'code_file');

                    for (const chunk of chunks) {
                        const embedding = await getEmbedding(chunk.content);
                        if (embedding) {
                            await collection.updateOne(
                                { repo: repoConfig.repo, path: filePath, chunk_index: chunk.index },
                                {
                                    $set: {
                                        content: chunk.content,
                                        embedding: embedding,
                                        repo: repoConfig.repo,
                                        path: filePath,
                                        url: `${details.html_url}/blob/${repoConfig.branch}/${filePath}`,
                                        type: 'code_file',
                                        chunk_index: chunk.index,
                                        updated_at: new Date()
                                    },
                                    $setOnInsert: { created_at: new Date() }
                                },
                                { upsert: true }
                            );
                        }
                    }
                }
            }
        }

        console.log("GitHub Ingestion Complete!");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

main();
