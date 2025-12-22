import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { generateEmbeddings } from '@/lib/embeddings';
import { searchSimilar } from '@/lib/vectorStore';
import { buildPrompt } from '@/lib/buildPrompt';
import projectsData from '@/data/projects.json';
import { Project } from '@/types/project';
import { fetchGitHubData, getFileContent, getRepoTree } from '@/lib/github';
import { checkRateLimit } from '@/lib/rateLimit';
import { chatMemory } from '@/lib/chatMemory';
import { withCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Cast JSON data to Project type
const projects: Project[] = projectsData as unknown as Project[];

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Function definitions for GPT to call
const functions = [
    {
        name: "read_github_file",
        description: "Read the content of a specific file from a GitHub repository. Use this when the user asks about specific code implementation or wants to see a particular file.",
        parameters: {
            type: "object",
            properties: {
                owner: {
                    type: "string",
                    description: "The repository owner (e.g., 'SalmanFarse2021')"
                },
                repo: {
                    type: "string",
                    description: "The repository name (e.g., '3D-Portfolio')"
                },
                path: {
                    type: "string",
                    description: "The file path within the repository (e.g., 'src/components/AIChat.tsx')"
                }
            },
            required: ["owner", "repo", "path"]
        }
    },
    {
        name: "get_repo_structure",
        description: "Get the directory structure of a GitHub repository. Use this when the user asks about the project structure, organization, or wants to see what files exist.",
        parameters: {
            type: "object",
            properties: {
                owner: {
                    type: "string",
                    description: "The repository owner (e.g., 'SalmanFarse2021')"
                },
                repo: {
                    type: "string",
                    description: "The repository name"
                },
                branch: {
                    type: "string",
                    description: "The branch name (default: 'main')",
                    default: "main"
                }
            },
            required: ["owner", "repo"]
        }
    }
];

// Handle function calls
async function handleFunctionCall(functionName: string, args: any): Promise<string> {
    try {
        if (functionName === "read_github_file") {
            const { owner, repo, path } = args;
            const content = await getFileContent(owner, repo, path);
            if (!content) {
                return `Unable to read file ${path} from ${owner}/${repo}. File may not exist or there was an error accessing it.`;
            }
            return `File: ${owner}/${repo}/${path}\n\n${content}`;
        } else if (functionName === "get_repo_structure") {
            const { owner, repo, branch = "main" } = args;
            const files = await getRepoTree(owner, repo, branch);
            if (!files || files.length === 0) {
                return `Unable to fetch repository structure for ${owner}/${repo}. Repository may not exist or there was an error.`;
            }
            return `Repository structure for ${owner}/${repo}:\n\n${files.join('\n')}`;
        }
        return "Function not found.";
    } catch (error: any) {
        logger.error('Function call error:', error);
        return `Error executing function: ${error.message}`;
    }
}

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN || '20', 10);
    const { success } = checkRateLimit(`chat-${ip}`, { limit, window: 60 * 1000 });

    if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
    }

    if (!openai) {
        return NextResponse.json({
            error: 'AI service not configured. Please contact the administrator.',
            response: "I apologize, but the AI service is currently unavailable. Please try again later."
        }, { status: 500 });
    }

    try {
        const body = await request.json();
        const schema = z.object({
            message: z.string().min(1), // Single user message
            conversationId: z.string().optional(),
            repoFilter: z.string().optional(),
            mode: z.enum(['general', 'recruiter', 'tech']).optional()
        });

        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error }, { status: 400 });
        }

        const { message: userQuery, conversationId: reqConvId, repoFilter, mode = 'general' } = validation.data;
        const conversationId = reqConvId || uuidv4();
        const start = Date.now();
        const TOP_K = parseInt(process.env.TOP_K || '10', 10);

        logger.info('Chat Request Received', { conversationId, mode, repoFilter });

        // 1. Save User Message
        await chatMemory.addMessage(conversationId, { role: 'user', content: userQuery });

        // 2. Fetch History
        const history = await chatMemory.getMessages(conversationId);
        const recentHistory = history.slice(-20);

        // 3. Retrieval (Cached)
        // Cache Key: query + repoFilter (so different filters get different context)
        const cacheKey = `context-${userQuery}-${repoFilter || 'all'}`;

        const contextChunks = await withCache(cacheKey, async () => {
            // A. Generate Embedding
            const [embedding] = userQuery ? (await generateEmbeddings([userQuery])) || [] : [];
            if (!embedding) return [];

            // B. Vector Search
            return await searchSimilar(embedding, TOP_K, repoFilter);
        });

        const retrievalLatency = Date.now() - start;
        logger.info('Retrieval Complete', {
            chunksFound: contextChunks.length,
            latencyMs: retrievalLatency,
            cached: contextChunks.length > 0 // rough proxy, improved if withCache returned meta
        });

        // 4. Construct Context Block
        const ragContext = contextChunks.length > 0 ? contextChunks.map(doc => `
---
File: ${doc.repo}/${doc.path}
URL: ${doc.url}
Type: ${doc.type}
Content:
${doc.content}
---
`).join('\n') : 'No relevant code context found in vector store.';

        const githubData = await fetchGitHubData();
        const baseSystemPrompt = buildPrompt(projects, userQuery, githubData, mode as any); // Cast mode if TS complains about literal vs string

        const systemMessageContent = `
${baseSystemPrompt}

=== RELEVANT CODEBASE CONTEXT (Retrieved from RAG) ===
${ragContext}

=== FUNCTION CALLING INSTRUCTIONS ===
You have access to GitHub repository reading functions:
1. **read_github_file**: Read specific files from repositories
2. **get_repo_structure**: Get directory structure of repositories

=== RAG USAGE INSTRUCTIONS ===
- Use the provided Context Block to answer technical questions about code.
- Cite your sources! When referencing code, mention the file path and consider adding a markdown link using the URL provided.

=== RESPONSE GUIDELINES ===
- Be conversational and natural while remaining professional
- Understand context from previous messages in the conversation
`;

        const apiMessages = [
            { role: "system", content: systemMessageContent },
            ...recentHistory.map(m => ({
                role: m.role,
                content: m.content || "",
                name: m.name,
                function_call: m.function_call
            }))
        ];

        // 6. Loop for Function Calling (Synchronous Phase)
        const functionCalls: any[] = [];
        let keepChecking = true;
        let loopCount = 0;
        const MAX_LOOPS = 5;

        while (keepChecking && loopCount < MAX_LOOPS) {
            const completion = await openai.chat.completions.create({
                messages: apiMessages as any,
                model: "gpt-4o",
                functions: functions as any,
                function_call: "auto",
                stream: false,
            });

            const responseMessage = completion.choices[0].message;

            if (responseMessage.function_call) {
                const functionName = responseMessage.function_call.name;
                const functionArgs = JSON.parse(responseMessage.function_call.arguments);
                logger.info('Function called (Pre-stream)', { function: functionName, args: functionArgs });

                const functionResult = await handleFunctionCall(functionName, functionArgs);
                functionCalls.push({ name: functionName, result: functionResult });

                apiMessages.push({
                    role: "assistant", // Manually typed
                    content: null,
                    function_call: responseMessage.function_call // This might need explicit typing if TS complains, but usually OK with 'any' cast
                } as any);
                apiMessages.push({
                    role: "function",
                    name: functionName,
                    content: functionResult
                });

                loopCount++;
            } else {
                keepChecking = false;
            }
        }

        // 7. Final Streaming Response
        const stream = await openai.chat.completions.create({
            messages: apiMessages as any,
            model: "gpt-4o",
            stream: true,
            functions: undefined,
            function_call: undefined
        });

        // 8. Spy on stream to save to memory
        let fullResponse = "";

        // We will read the stream, build the full response, and pass chunks to the client.
        const outputStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        fullResponse += text;
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                // Save to memory
                if (fullResponse) {
                    await chatMemory.addMessage(conversationId, { role: 'assistant', content: fullResponse });
                }
                controller.close();
            }
        });

        const sources = contextChunks.map(c => ({
            repo: c.repo,
            path: c.path,
            url: c.url
        }));

        return new NextResponse(outputStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'x-citations': JSON.stringify(sources),
                'x-function-calls': JSON.stringify(functionCalls.map(fc => fc.name)),
                'x-conversation-id': conversationId
            }
        });

    } catch (error: any) {
        logger.error('Chat API error:', error);

        const userMessage = error.code === 'insufficient_quota'
            ? 'Service limit reached.'
            : 'An error occurred processing your request.';

        return new NextResponse(userMessage, { status: 500 });
    }
}
