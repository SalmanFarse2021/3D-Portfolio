import OpenAI from 'openai';
import { Project } from '@/types/project';
import projectsData from '@/data/projects.json';
import { buildPrompt } from './buildPrompt';
import { fetchGitHubData } from './github';

// Cast JSON data to Project type
const projects: Project[] = projectsData as unknown as Project[];

if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set. AI features will not work.');
}

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    : null;

/**
 * Generate AI response using OpenAI
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
    if (!openai) {
        return "I'm sorry, but the AI service is not configured. Please contact the site administrator.";
    }

    // Fetch GitHub data for real-time context
    const githubData = await fetchGitHubData();

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const prompt = buildPrompt(projects, userMessage, githubData);

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "user", content: prompt }
                ],
                model: "gpt-5.1",
                temperature: 0.4,
            });

            const content = completion.choices[0].message.content;
            return content || "I apologize, but I couldn't generate a response.";
        } catch (error: any) {
            console.error(`Attempt ${retries + 1} failed:`, error.message);

            if (error.status === 429 || error.status === 500 || error.status === 503) {
                retries++;
                if (retries < maxRetries) {
                    const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            console.error('Final Error generating AI response:', error);
            if (error.status === 429) {
                return "I'm currently receiving too many requests. Please try again in a minute.";
            }
            return "I apologize, but I encountered an error processing your request. Please try again later.";
        }
    }
    return "I apologize, but I encountered an error processing your request. Please try again later.";
}
