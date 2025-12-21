import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData, getReadme, getFileContent, getRepoTree } from '@/lib/github';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 300;

interface ProjectCard {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    image?: string;
    githubLink: string;
    websiteLink?: string;
    architecture?: string;
    highlights?: string[];
    challenges?: string[];
    learnings?: string[];
}

export async function POST(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = checkRateLimit(`projects-gen-${ip}`, { limit: 3, window: 60 * 60 * 1000 });
    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Admin auth
    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        logger.info('Starting project cards generation...');
        const ghData = await fetchGitHubData();
        if (!ghData) {
            return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
        }

        const projectCards: ProjectCard[] = [];

        for (const repo of ghData.repositories) {
            logger.info(`Analyzing repo: ${repo.name}`);

            // Get README
            const readme = await getReadme(ghData.profile.login, repo.name);
            if (!readme) {
                logger.info(`Skipping ${repo.name} - no README found`);
                continue;
            }

            // Get package.json if exists
            let packageJson = null;
            try {
                const pkgContent = await getFileContent(ghData.profile.login, repo.name, 'package.json');
                if (pkgContent) {
                    packageJson = JSON.parse(pkgContent);
                }
            } catch (e) {
                // No package.json, that's okay
            }

            // Analyze with AI
            const analysisPrompt = `Analyze this GitHub repository and extract structured information.

Repository: ${repo.name}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Stars: ${repo.stargazers_count}

README Content:
${readme.substring(0, 4000)}

${packageJson ? `Package.json dependencies: ${JSON.stringify(packageJson.dependencies || {}, null, 2)}` : ''}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "title": "Project Name",
  "oneLiner": "Brief one-sentence description",
  "technologies": ["Tech1", "Tech2", "Tech3"],
  "architecture": "Brief architecture description (2-3 sentences)",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "challenges": ["Challenge 1", "Challenge 2"],
  "learnings": ["Learning 1", "Learning 2"]
}

Be concise and technical. Focus on actual implementation details from the README.`;

            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a technical analyst extracting structured project information. Return ONLY valid JSON, no markdown formatting.' },
                        { role: 'user', content: analysisPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                });

                const responseText = completion.choices[0].message.content?.trim() || '{}';
                // Remove markdown code blocks if present
                const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const analysis = JSON.parse(jsonText);

                const projectCard: ProjectCard = {
                    id: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    title: analysis.title || repo.name,
                    description: analysis.oneLiner || repo.description || 'No description available',
                    technologies: analysis.technologies || [repo.language].filter(Boolean),
                    githubLink: repo.html_url,
                    websiteLink: repo.homepage || undefined,
                    architecture: analysis.architecture,
                    highlights: analysis.highlights,
                    challenges: analysis.challenges,
                    learnings: analysis.learnings
                };

                projectCards.push(projectCard);
                logger.info(`Generated card for ${repo.name}`);

            } catch (e: any) {
                logger.error(`Failed to analyze ${repo.name}:`, e.message);
                // Fallback to basic info
                projectCards.push({
                    id: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    title: repo.name,
                    description: repo.description || 'No description available',
                    technologies: [repo.language].filter(Boolean) as string[],
                    githubLink: repo.html_url,
                    websiteLink: repo.homepage || undefined
                });
            }
        }

        return NextResponse.json({
            success: true,
            projects: projectCards,
            count: projectCards.length
        });

    } catch (error: any) {
        logger.error('Project generation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
