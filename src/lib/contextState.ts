import projectsData from '@/data/projects.json';
import { Project } from '@/types/project';
import { memoryStore } from '@/lib/memoryStore';

const projects: Project[] = projectsData as unknown as Project[];

// Map project titles/keywords to their normalized keys (or Repo names)
// Assuming repo names are sufficient, otherwise we might need a mapping.
// For this portfolio, we will use project titles and likely map to repo names if available,
// or just use titles as the "context key".
// But the RAG system uses `repo` and `path`.
// `projects.json` has `githubLink` which contains the repo URL.
// We should extract the repo name from the URL or title.

function getRepoFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1].replace('.git', '');
}

const PROJECT_KEYWORDS = projects.map(p => ({
    title: p.title.toLowerCase(),
    repo: getRepoFromUrl(p.githubLink) || p.title, // Fallback to title if no repo
    keywords: [p.title.toLowerCase(), ...(p.technologies || []).map(t => t.toLowerCase())]
}));

// Add distinct entry for the Portfolio itself
PROJECT_KEYWORDS.push({
    title: 'portfolio',
    repo: '3D-Portfolio', // Or whatever strict repo name you want
    keywords: ['portfolio', 'this website', 'this app', 'this site']
});

export async function resolveProjectContext(sessionId: string, message: string): Promise<{ activeRepo: string | null; isAmbiguous: boolean }> {
    const msg = message.toLowerCase();

    // 1. Check for explicit project mentions
    for (const p of PROJECT_KEYWORDS) {
        if (msg.includes(p.title) || (p.repo && msg.includes(p.repo.toLowerCase()))) {
            // Found explicit mention
            await memoryStore.setActiveRepo(sessionId, p.repo);
            return { activeRepo: p.repo, isAmbiguous: false };
        }
    }

    // 2. Check for pronouns requiring context
    const pronouns = [' it ', ' this ', ' that ', ' the project ', ' the app ', ' the repo '];
    const hasPronoun = pronouns.some(p => msg.includes(p));

    const currentActiveRepo = await memoryStore.getActiveRepo(sessionId);

    if (hasPronoun) {
        if (currentActiveRepo) {
            // Assume they mean the active repo
            return { activeRepo: currentActiveRepo, isAmbiguous: false };
        } else {
            // Pronoun used but no active repo -> Ambiguous!
            return { activeRepo: null, isAmbiguous: true };
        }
    }

    // 3. If no mentions and no pronouns, keep current context? 
    // Usually if they ask "how does the auth work?", it implies the active context.
    // If they just say "hello", it implies none.
    // We'll return currentActiveRepo but mark distinct if needed. 
    // For now, return current.
    // Recompile trigger
    return { activeRepo: currentActiveRepo, isAmbiguous: false };
}

export function getProjectSummary(repoName: string | null): string {
    if (!repoName) return "";
    const p = projects.find(p => p.title === repoName || getRepoFromUrl(p.githubLink) === repoName);
    if (!p) return "";
    return `Active Project: ${p.title}\nDescription: ${p.description}\nTech Stack: ${p.technologies.join(', ')}`;
}
