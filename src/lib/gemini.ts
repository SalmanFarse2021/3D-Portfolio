import { GoogleGenerativeAI } from '@google/generative-ai';
import { Project } from '@/types/project';
import projectsData from '@/data/projects.json';
import { buildPrompt } from './buildPrompt';

// Cast JSON data to Project type
const projects: Project[] = projectsData as unknown as Project[];

if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Generate AI response using Gemini
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
    if (!genAI) {
        return "I'm sorry, but the AI service is not configured. Please contact the site administrator.";
    }

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            // Use gemini-2.5-flash model with specific configuration
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.4,
                }
            });

            const prompt = buildPrompt(projects, userMessage);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error: any) {
            console.error(`Attempt ${retries + 1} failed:`, error.message);

            if (error.status === 429 || error.message?.includes('429') || error.status === 503) {
                retries++;
                if (retries < maxRetries) {
                    const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            // If it's not a retryable error or we ran out of retries
            console.error('Final Error generating AI response:', error);
            if (error.status === 429) {
                return "I'm currently receiving too many requests. Please try again in a minute.";
            }
            return "I apologize, but I encountered an error processing your request. Please try again later.";
        }
    }
    return "I apologize, but I encountered an error processing your request. Please try again later.";
}
