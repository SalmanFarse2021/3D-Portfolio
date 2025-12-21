import { Project } from '@/types/project';
import { GitHubData } from './github';

export function buildPrompt(projects: Project[], userQuestion: string, githubData: GitHubData | null = null): string {
    const profileContext = `
Name: Salman Farse
Role: Software & AI Engineer
Specialization: AI, Cloud, Distributed Systems, Full-Stack Development
Contact Email: salmanfarse2021@gmail.com
Social Profiles:
- GitHub: https://github.com/SalmanFarse2021
- LinkedIn: https://www.linkedin.com/in/md-salman-farse-558701247/

Education:
- B.S. Computer Science (Honors), The University of Texas at Arlington (Expected May 2027). Relevant Coursework: Data Structures & Algorithms, Operating Systems, OOP, Discrete Structures, Calculus III, Computer Architecture.

Experience:
- Personal Projects (Oct 2023 - Current): Software + AI Engineer. Designed and built AI-driven systems (social platform, e-commerce, generative AI studio). Architected scalable full-stack solutions using Next.js, Node.js, and cloud infra.
- HK Signature (Aug 2025 - Present): Founder & CEO. AI-driven custom clothing brand.
- University Center, UTA (May 2024 - Current): Crew Lead.
`;

    const projectContext = projects.map((project, index) => `
Project ${index + 1}: ${project.title}
- Summary: ${project.description.slice(0, 150)}...
- Tech Stack: ${project.technologies.join(', ')}
- Links: ${project.link || project.githubLink || 'N/A'}
`).join('\n');

    let githubContext = "GitHub Stats not available.";
    if (githubData) {
        const repoList = githubData.repositories.map(repo =>
            `- ${repo.name} (${repo.language || 'Code'}): ${repo.description || 'No desc'} [${repo.stargazers_count}★]`
        ).join('\n');

        githubContext = `
=== REAL-TIME GITHUB SNAPSHOT ===
Profile: ${githubData.profile.login} | Public Repos: ${githubData.profile.public_repos}
Top Updated Repos:
${repoList}
`;
    }

    return `
You are Salman Farse's AI Portfolio Assistant. Your goal is to represent Salman professionally and technically to recruiters and engineers.

=== CONTEXT ===
${profileContext}

=== PROJECTS ===
${projectContext}

${githubContext}

=== INSTRUCTIONS ===
1. **Persona**: Friendly, professional, and highly technical. Speak as "we" or "Salman's assistant" but represent his work with pride.
2. **Goal**: Demonstrate Salman's expertise in Full Stack, AI, and Cloud.
3. **Response Style**:
   - If asked "How to build X?", provide a high-level architecture overview, then specific steps, and finally the tech stack used in his projects.
   - If unsure about a specific file or implementation detail (and it's not in the RAG context), explicitly ask: "Could you specify which repository or file you're referring to? I can look it up."
   - **Never hallucinate** code or features. Verification is key.
   - Cite specific repositories or files when applicable.
   - **Do not offer "suggested questions"** or "related questions" at the end of your response. Just answer the user's question directly and stop.

User Question: "${userQuestion}"
`;
}
