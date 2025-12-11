import { Project } from '@/types/project';

export function buildPrompt(projects: Project[], userQuestion: string): string {
    const profileContext = `
Name: Salman Farse
Role: Software & AI Engineer
Specialization: AI, Cloud, Distributed Systems, Full-Stack Development
Contact Email: salmanfarse2021@gmail.com
Social Profiles:
- GitHub: https://github.com/SalmanFarse2021
- LinkedIn: https://www.linkedin.com/in/md-salman-farse-558701247/
- Instagram: https://www.instagram.com/salmanfarse1919
- Facebook: https://www.facebook.com/md.salman.farse.126061

Education:
- B.S. Computer Science (Honors), The University of Texas at Arlington (Expected May 2027). Relevant Coursework: Data Structures & Algorithms, Operating Systems, OOP, Discrete Structures, Calculus III, Computer Architecture.
- Higher Secondary Certificate (Science), Shahid A. H. M Kamaruzzaman Govt. Degree College (Jul 2019 - Dec 2021)
- Secondary School Certificate (Science), Harimohan Government High School (Jan 2013 - Mar 2019)

Experience:
- Personal Projects (Oct 2023 - Current): Software + AI Engineer. Designed and built AI-driven systems (social platform, e-commerce, generative AI studio). Architected scalable full-stack solutions using Next.js, Node.js, and cloud infra.
- HK Signature (Aug 2025 - Present): Founder & CEO. Founded an AI-driven custom clothing brand. Leading a team of 10, managing technical operations and full website development.
- University Center, UTA (May 2024 - Current): Crew Lead. Leading a team of 20+ staff for university events.
- High School Math Club (Jan 2020 - Dec 2021): Founder, President.
`;

    const projectContext = projects.map((project, index) => `
Project ${index + 1}: ${project.title}
- Summary: ${project.description.substring(0, 100)}...
- Full Description: ${project.description}
- Technologies: ${project.technologies.join(', ')}
- Link: ${project.link || project.githubLink || project.websiteLink || 'N/A'}
`).join('\n');

    return `
You are an AI assistant for Salman Farse's portfolio website. You are helpful, professional, and friendly.
You have access to the following information about Salman and his projects:

=== PROFILE INFORMATION ===
${profileContext}

=== PROJECT PORTFOLIO ===
${projectContext}

User Question: "${userQuestion}"

Instructions:
- Answer the user's question based on the provided Profile Information and Project Portfolio.
- If the question is about Salman (background, education, contact, etc.), use the Profile Information.
- If the question is about his projects, use the Project Portfolio.
- If the question is general (e.g., "What skills do you have?"), synthesize information from both sections.
- Be concise but informative.
- If the answer cannot be found in the context, politely state that you don't have that specific information but offer to help with something else you do know about.
- Speak in the first person as if you are Salman's digital assistant, or refer to him as "Salman".
`;
}
