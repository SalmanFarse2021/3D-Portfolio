import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { generateEmbeddings } from '@/lib/embeddings';
import { searchSimilar } from '@/lib/vectorStore';
import { buildPrompt } from '@/lib/buildPrompt';
import projectsData from '@/data/projects.json';
import { Project } from '@/types/project';
import { fetchGitHubData, getFileContent, getRepoTree } from '@/lib/github';
import { checkRateLimit } from '@/lib/rateLimit';
import { memoryStore } from '@/lib/memoryStore';
import { withCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { resolveProjectContext } from '@/lib/contextState';
import { buildMessages } from '@/lib/buildMessages';

export const maxDuration = 60;

const projects: Project[] = projectsData as unknown as Project[];

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

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
                    description: "The repository name"
                },
                path: {
                    type: "string",
                    description: "The file path within the repository"
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
    },
    {
        name: "read_website",
        description: "Read the content of a public website URL. Use this to inspect the live content, features, or UI of a deployed project link.",
        parameters: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "The URL to fetch content from."
                }
            },
            required: ["url"]
        }
    }
];

async function handleFunctionCall(functionName: string, args: any): Promise<string> {
    try {
        if (functionName === "read_github_file") {
            const { owner, repo, path } = args;
            const content = await getFileContent(owner, repo, path);
            if (!content) return `Unable to read file ${path} from ${owner}/${repo}. File may not exist.`;
            return `File: ${owner}/${repo}/${path}\n\n${content.slice(0, 10000)}${content.length > 10000 ? '\n...(TRUNCATED)' : ''}`;
        } else if (functionName === "get_repo_structure") {
            const { owner, repo, branch = "main" } = args;
            const files = await getRepoTree(owner, repo, branch);
            if (!files || files.length === 0) return `Unable to fetch repository structure for ${owner}/${repo}.`;
            const fileList = files.join('\n');
            return `Repository structure for ${owner}/${repo}:\n\n${fileList.slice(0, 10000)}${fileList.length > 10000 ? '\n...(TRUNCATED)' : ''}`;
        } else if (functionName === "read_website") {
            const { url } = args;
            try {
                const res = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Bot)' }
                });
                if (!res.ok) return `Failed to fetch website: ${res.status} ${res.statusText}`;

                const html = await res.text();
                // Simple text extraction - removing tags and scripts/styles
                const text = html
                    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                    .replace(/<[^>]+>/g, "\n")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 5000); // Truncate to avoid context limit overflow

                return `Website Content (${url}):\n\n${text}... (Content truncated)`;
            } catch (err: any) {
                return `Error fetching website: ${err.message}`;
            }
        }
        return "Function not found.";
    } catch (error: any) {
        logger.error('Function call error:', error);
        return `Error executing function: ${error.message}`;
    }
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN || '20', 10);
    const { success } = checkRateLimit(`chat-${ip}`, { limit, window: 60 * 1000 });

    if (!success) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    if (!openai) {
        return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
    }

    let ragContext: string | null = null;
    let baseSystemPrompt = "";
    let apiMessages: any[] = [];
    let conversationId = "unknown";
    const TOP_K = parseInt(process.env.TOP_K || '3', 10);

    try {
        const body = await request.json();
        const schema = z.object({
            message: z.string().min(1),
            conversationId: z.string().optional(),
            repoFilter: z.string().optional(),
            mode: z.enum(['general', 'recruiter', 'tech']).optional(),
            previousMessages: z.array(z.object({
                role: z.enum(['user', 'system', 'assistant', 'function']),
                content: z.string().nullable().optional(),
                name: z.string().optional()
            })).optional()
        });

        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { message: userQuery, conversationId: reqConvId, repoFilter, mode = 'general', previousMessages } = validation.data;
        conversationId = reqConvId || uuidv4();
        const start = Date.now();
        // const TOP_K moved up

        logger.info('Chat Request Received', { conversationId, mode, repoFilter });

        // 1. Save User Message
        // We still save to memoryStore as a backup/log, but we don't rely on it for context if previousMessages is present
        await memoryStore.addTurn(conversationId, 'user', userQuery);

        // 2. Resolve Context Logic (Step 3)
        const { activeRepo, isAmbiguous } = await resolveProjectContext(conversationId, userQuery);

        if (isAmbiguous) {
            const clarification = "Which project are you referring to? (e.g. Portfolio, Fintrion)";
            await memoryStore.addTurn(conversationId, 'assistant', clarification);
            return new NextResponse(clarification, {
                headers: { 'x-conversation-id': conversationId }
            });
        }

        const effectiveRepo = activeRepo || repoFilter || 'all';
        const cacheKey = `context-${userQuery}-${effectiveRepo}`;

        // 3. Retrieval (Cached)
        const contextChunks = await withCache(cacheKey, async () => {
            const [embedding] = userQuery ? (await generateEmbeddings([userQuery])) || [] : [];
            if (!embedding) return [];
            return await searchSimilar(embedding, TOP_K, repoFilter || (activeRepo ? undefined : undefined));
        });

        // 4. Construct Prompt
        ragContext = contextChunks.length > 0 ? contextChunks.map(doc => `
---
File: ${doc.repo}/${doc.path}
URL: ${doc.url}
Content:
${doc.content}
---
`).join('\n') : null;

        const githubData = await fetchGitHubData();
        // Update: Pass activeRepo to buildPrompt
        baseSystemPrompt = buildPrompt(
            projects,
            userQuery,
            githubData,
            mode as any,
            activeRepo || null
        );

        // 5. Build Messages (Step 4)
        apiMessages = await buildMessages(
            conversationId,
            baseSystemPrompt,
            ragContext,
            previousMessages as any[] // Pass client-side history
        );

        // 6. Loop for Function Calling
        const functionCalls: any[] = [];
        let keepChecking = true;
        let loopCount = 0;
        const MAX_LOOPS = 5;

        while (keepChecking && loopCount < MAX_LOOPS) {
            const completion = await openai.chat.completions.create({
                messages: apiMessages,
                model: "gpt-4o",
                functions: functions as any,
                function_call: "auto",
                stream: false,
            });

            const responseMessage = completion.choices[0].message;

            if (responseMessage.function_call) {
                const functionName = responseMessage.function_call.name;
                const functionArgs = JSON.parse(responseMessage.function_call.arguments);
                logger.info('Function called', { function: functionName });

                const functionResult = await handleFunctionCall(functionName, functionArgs);
                functionCalls.push({ name: functionName, result: functionResult });

                apiMessages.push(responseMessage);
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

        // 7. Streaming Response
        const stream = await openai.chat.completions.create({
            messages: apiMessages,
            model: "gpt-4o",
            stream: true,
        });

        let fullResponse = "";
        const outputStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        fullResponse += text;
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                if (fullResponse) {
                    await memoryStore.addTurn(conversationId, 'assistant', fullResponse);
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
        const debugInfo = {
            ragSize: ragContext ? ragContext.length : 0,
            systemPromptSize: baseSystemPrompt.length,
            historySize: JSON.stringify(apiMessages).length,
            messagesCount: apiMessages.length,
            topK: TOP_K,
            conversationId,
            messageRoles: apiMessages.map(m => m.role)
        };
        logger.error('Chat API error:', { error, debugInfo });
        return new NextResponse(`An error occurred: ${error.message}\nDebug: ${JSON.stringify(debugInfo, null, 2)}\n${error.stack}`, { status: 500 });
    }
}
