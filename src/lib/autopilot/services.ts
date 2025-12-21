import OpenAI from 'openai';
import { AUTOPILOT_CONFIG } from './config';

// --- Interfaces (matching core.ts) ---

export interface GitHubService {
    fetchRepoTree(repoUrl: string): Promise<string[]>;
    fetchFileContent(repoUrl: string, filePath: string): Promise<string>;
    // Git operations are placeholders for now as we don't have write access/tokens configured
    createBranch(repoUrl: string, branchName: string): Promise<void>;
    commitAndPush(repoUrl: string, branchName: string, message: string, files: Record<string, string>): Promise<void>;
    createPullRequest(repoUrl: string, title: string, body: string, head: string, base: string): Promise<string>;
}

export interface AIService {
    generateContent(prompt: string): Promise<string>;
}

// --- Implementations ---

export class GitHubServiceImpl implements GitHubService {
    private baseUrl = 'https://api.github.com';

    private getRepoDetails(repoUrl: string) {
        const parts = repoUrl.replace(/\/$/, '').split('/');
        const owner = parts[parts.length - 2];
        const name = parts[parts.length - 1];
        return { owner, name };
    }

    async fetchRepoTree(repoUrl: string): Promise<string[]> {
        const { owner, name } = this.getRepoDetails(repoUrl);
        // Get default branch first
        const repoRes = await fetch(`${this.baseUrl}/repos/${owner}/${name}`);
        if (!repoRes.ok) throw new Error(`Failed to fetch repo info: ${repoRes.statusText}`);
        const repoData = await repoRes.json();
        const branch = repoData.default_branch;

        // Fetch tree recursively
        const treeRes = await fetch(`${this.baseUrl}/repos/${owner}/${name}/git/trees/${branch}?recursive=1`);
        if (!treeRes.ok) throw new Error(`Failed to fetch repo tree: ${treeRes.statusText}`);
        const treeData = await treeRes.json();

        // Filter for blobs (files) only
        return treeData.tree
            .filter((item: any) => item.type === 'blob')
            .map((item: any) => item.path);
    }

    async fetchFileContent(repoUrl: string, filePath: string): Promise<string> {
        const { owner, name } = this.getRepoDetails(repoUrl);
        // Use raw.githubusercontent.com for content to avoid API rate limits
        // HEAD automatically points to the default branch (main/master)
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${name}/HEAD/${filePath}`;

        const res = await fetch(rawUrl);

        if (!res.ok) throw new Error(`Failed to fetch file ${filePath}: ${res.statusText}`);
        return await res.text();
    }

    async createBranch(repoUrl: string, branchName: string): Promise<void> {
        console.log(`[Mock] Creating branch ${branchName} on ${repoUrl}`);
    }

    async commitAndPush(repoUrl: string, branchName: string, message: string, files: Record<string, string>): Promise<void> {
        console.log(`[Mock] Committing to ${branchName}: ${message}`);
        console.log(`[Mock] Files: ${Object.keys(files).join(', ')}`);
    }

    async createPullRequest(repoUrl: string, title: string, body: string, head: string, base: string): Promise<string> {
        console.log(`[Mock] Creating PR: ${title}`);
        return 'https://github.com/mock/pr/1';
    }
}

export class OpenAIServiceImpl implements AIService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateContent(prompt: string): Promise<string> {
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                const completion = await this.openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: AUTOPILOT_CONFIG.MODEL_NAME,
                    temperature: AUTOPILOT_CONFIG.TEMPERATURE,
                });

                let text = completion.choices[0].message.content || '';

                // Clean up Markdown code blocks if present in JSON response
                if (text.startsWith('```json')) {
                    text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
                } else if (text.startsWith('```')) {
                    text = text.replace(/^```\n/, '').replace(/\n```$/, '');
                }

                return text;
            } catch (error: any) {
                if (error.status === 429) {
                    retries++;
                    const delay = Math.pow(2, retries) * 2000; // 4s, 8s, 16s
                    console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                console.error('OpenAI generation error:', error);
                throw error;
            }
        }
        throw new Error('Max retries exceeded for OpenAI API');
    }
}
