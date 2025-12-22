import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateEmbeddings } from '@/lib/embeddings';
import { searchSimilar } from '@/lib/vectorStore';
import { buildPrompt } from '@/lib/buildPrompt';
import projectsData from '@/data/projects.json';
import { Project } from '@/types/project';
import { fetchGitHubData } from '@/lib/github';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

// Cast JSON data to Project type
const projects: Project[] = projectsData as unknown as Project[];

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = checkRateLimit(`chat-${ip}`, { limit: 20, window: 60 * 1000 }); // 20 per minute
    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!openai) {
        return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    try {
        const { messages, repoFilter } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        // Get the last user message for RAG context
        const lastUserMessage = messages[messages.length - 1];
        const userQuery = lastUserMessage.content;

        // 1. Generate Query Embedding
        const [embedding] = (await generateEmbeddings([userQuery])) || [];
        if (!embedding) {
            logger.warn('Failed to generate embedding for query');
        }

        // 2. Vector Search (RAG)
        let contextChunks: any[] = [];
        if (embedding) {
            contextChunks = await searchSimilar(embedding, 8, repoFilter); // Top 8 chunks
        }

        // 3. Construct Context Block from RAG results
        const ragContext = contextChunks.map(doc => `
---
File: ${doc.repo}/${doc.path}
URL: ${doc.url}
Type: ${doc.type}
Content:
${doc.content}
---
`).join('\n');

        // 4. Fetch GitHub Profile (Lightweight Stats)
        const githubData = await fetchGitHubData();

        // 5. Build System Prompt
        // We pass the userQuery just for logging/reference in buildPrompt if needed, 
        // but the prompt itself will be the system instructions.
        const baseSystemPrompt = buildPrompt(projects, userQuery, githubData);

        // Inject RAG context into the system prompt
        const systemMessageContent = `
${baseSystemPrompt}

=== RELEVANT CODEBASE CONTEXT (Retrieved from RAG) ===
${ragContext}

Instructions for RAG:
- Use the provided Context Block to answer technical questions about code.
- Cite your sources! When referencing code, mention the file path and consider adding a markdown link using the URL provided.
- If the answer is found in the context, be specific.
- If the context doesn't contain the answer, rely on your general knowledge but admit if you can't see the specific file code requested.
`;

        // 6. Call OpenAI with History
        // Construct the full message chain: System Message + Conversation History
        const apiMessages = [
            { role: "system", content: systemMessageContent },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            messages: apiMessages as any,
            model: "gpt-5.2", // User requested model
            temperature: 0.3, // Lower temp for factual QA
        });

        const responseContent = completion.choices[0].message.content;

        const sources = contextChunks.map(c => ({
            repo: c.repo,
            path: c.path,
            url: c.url
        }));

        logger.info('Chat response generated', { citations: sources.length });

        return NextResponse.json({
            response: responseContent,
            citations: sources
        });

    } catch (error: any) {
        logger.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
