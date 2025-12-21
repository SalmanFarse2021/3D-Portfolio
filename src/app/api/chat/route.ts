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
        const { message, repoFilter } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Generate Query Embedding
        const [embedding] = (await generateEmbeddings([message])) || [];
        if (!embedding) {
            logger.warn('Failed to generate embedding for query');
            // Fallback to standard context-less chat if embedding fails? 
            // For now, let's proceed with just basic context or fail.
            // Depending on reliability, falling back to buildPrompt without RAG is safer.
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
        // We override the standard buildPrompt with our RAG-enhanced version locally or pass it in
        const systemPrompt = buildPrompt(projects, message, githubData);

        // Inject RAG context into the prompt
        // We can append it to the system message or user message
        const fullPrompt = `
${systemPrompt}

=== RELEVANT CODEBASE CONTEXT (Retrieved from RAG) ===
${ragContext}

Instructions for RAG:
- Use the provided Context Block to answer technical questions about code.
- Cite your sources! When referencing code, mention the file path and consider adding a markdown link using the URL provided.
- If the answer is found in the context, be specific.
- If the context doesn't contain the answer, rely on your general knowledge but admit if you can't see the specific file code requested.
`;

        // 6. Call OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "user", content: fullPrompt }
            ],
            model: "gpt-5.1", // Or gpt-4o
            temperature: 0.3, // Lower temp for factual QA
        });

        const responseContent = completion.choices[0].message.content;

        // Extract citations if needed or rely on LLM to textually cite
        // We can return the source docs to the frontend for UI display
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
