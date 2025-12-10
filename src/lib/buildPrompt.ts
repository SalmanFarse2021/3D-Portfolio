import { Project } from '@/types/project';

export function buildPrompt(projects: Project[], userQuestion: string): string {
    const projectContext = projects.map((project, index) => `
Project ${index + 1}: ${project.title}
- Summary: ${project.description.substring(0, 100)}...
- Full Description: ${project.description}
- Technologies: ${project.technologies.join(', ')}
- Link: ${project.link}
`).join('\n');

    return `
You are an AI assistant for a developer's portfolio website. You have access to the following projects:

${projectContext}

User Question: "${userQuestion}"

Instructions:
- Answer the user's question based on the project information provided.
- If the question is about a specific project, provide detailed information.
- If the question is general, summarize the developer's skills based on the projects.
- Be helpful, professional, and concise.
- If the answer cannot be found in the context, politely state that you don't have that information.
`;
}
