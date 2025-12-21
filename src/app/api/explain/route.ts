import { NextRequest, NextResponse } from 'next/server';
import { getFileContent } from '@/lib/github';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_FILE_SIZE = 50000; // 50KB limit for code explanation

export async function POST(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = checkRateLimit(`explain-${ip}`, { limit: 10, window: 60 * 1000 });
    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { repo, path, owner, question } = body;

        if (!repo || !path || !owner) {
            return NextResponse.json({ error: 'Missing required fields: repo, path, owner' }, { status: 400 });
        }

        logger.info(`Explaining code: ${owner}/${repo}/${path}`);

        // Fetch file content
        const content = await getFileContent(owner, repo, path);
        if (!content) {
            return NextResponse.json({ error: 'File not found or empty' }, { status: 404 });
        }

        // Check file size
        if (content.length > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File too large (${content.length} bytes). Maximum ${MAX_FILE_SIZE} bytes.`
            }, { status: 413 });
        }

        // Build explanation prompt
        const explanationPrompt = `You are a senior software engineer explaining code to a technical interviewer.

File: ${path}
Repository: ${repo}

Code:
\`\`\`
${content}
\`\`\`

${question ? `Specific Question: ${question}` : 'Provide a comprehensive explanation of this code.'}

Instructions:
1. Start with a high-level overview (what does this code do?)
2. Explain the architecture/structure
3. Highlight key functions/classes and their purposes
4. Point out interesting patterns, best practices, or potential improvements
5. If there's a specific question, answer it in detail
6. Use technical language appropriate for a senior engineer interview

Be concise but thorough. Use markdown formatting.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical code reviewer and educator. Provide clear, insightful explanations of code with architectural context.'
                },
                { role: 'user', content: explanationPrompt }
            ],
            temperature: 0.4,
            max_tokens: 2000
        });

        const explanation = completion.choices[0].message.content || 'No explanation generated.';

        // Build GitHub URL
        const fileUrl = `https://github.com/${owner}/${repo}/blob/main/${path}`;

        return NextResponse.json({
            success: true,
            explanation,
            metadata: {
                file: path,
                repo,
                owner,
                url: fileUrl,
                lines: content.split('\n').length,
                size: content.length
            }
        });

    } catch (error: any) {
        logger.error('Code explanation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
