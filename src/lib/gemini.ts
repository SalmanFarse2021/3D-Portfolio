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

    try {
        // Use gemini-pro model with specific configuration
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.4,
            }
        });

        const prompt = buildPrompt(projects, userMessage);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return "I apologize, but I encountered an error processing your request. Please try again.";
    }
}
