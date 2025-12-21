import { Octokit } from 'octokit';
import { withCache } from './cache';

export interface GitHubData {
    profile: {
        login: string;
        name: string | null;
        bio: string | null;
        public_repos: number;
        followers: number;
        following: number;
        html_url: string;
    };
    repositories: {
        name: string;
        description: string | null;
        html_url: string;
        language: string | null;
        stargazers_count: number;
        updated_at: string | null;
        default_branch: string;
    }[];
}

const octokit = process.env.GITHUB_TOKEN
    ? new Octokit({ auth: process.env.GITHUB_TOKEN })
    : null;

/**
 * Fetch authenticated user profile and repositories (Cached)
 */
export async function fetchGitHubData(): Promise<GitHubData | null> {
    if (!octokit) {
        console.warn('GITHUB_TOKEN is not set. Skipping GitHub data fetch.');
        return null;
    }

    return withCache('github-data', async () => {
        try {
            const { data: profile } = await octokit!.rest.users.getAuthenticated();

            const { data: repos } = await octokit!.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 20,
                type: 'owner',
            });

            const repositories = repos.map(repo => ({
                name: repo.name,
                description: repo.description,
                html_url: repo.html_url,
                language: repo.language,
                stargazers_count: repo.stargazers_count || 0,
                updated_at: repo.updated_at,
                default_branch: repo.default_branch,
            }));

            return {
                profile: {
                    login: profile.login,
                    name: profile.name,
                    bio: profile.bio,
                    public_repos: profile.public_repos,
                    followers: profile.followers,
                    following: profile.following,
                    html_url: profile.html_url,
                },
                repositories,
            };
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            return null;
        }
    });
}

/**
 * Fetch README content (Cached)
 */
export async function getReadme(owner: string, repo: string): Promise<string | null> {
    if (!octokit) return null;
    return withCache(`readme-${owner}-${repo}`, async () => {
        try {
            const { data } = await octokit!.rest.repos.getReadme({
                owner,
                repo,
                mediaType: {
                    format: 'raw',
                },
            });
            return data as unknown as string;
        } catch (error: any) {
            if (error.status !== 404) {
                console.error(`Error fetching README for ${owner}/${repo}:`, error);
            }
            return null;
        }
    });
}

/**
 * Fetch file content (Cached)
 */
export async function getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    if (!octokit) return null;
    return withCache(`file-${owner}-${repo}-${path}`, async () => {
        try {
            const { data } = await octokit!.rest.repos.getContent({
                owner,
                repo,
                path,
                mediaType: {
                    format: 'raw',
                },
            });
            return data as unknown as string;
        } catch (error: any) {
            console.error(`Error fetching file ${path} for ${owner}/${repo}:`, error);
            return null;
        }
    });
}

/**
 * Fetch repository tree (Cached)
 */
export async function getRepoTree(owner: string, repo: string, branch: string): Promise<string[]> {
    if (!octokit) return [];
    return withCache(`tree-${owner}-${repo}-${branch}`, async () => {
        try {
            const { data } = await octokit!.rest.git.getTree({
                owner,
                repo,
                tree_sha: branch,
                recursive: '1',
            });

            return data.tree
                .filter((item) => item.type === 'blob' && item.path)
                .map((item) => item.path!);
        } catch (error) {
            console.error(`Error fetching tree for ${owner}/${repo}:`, error);
            return [];
        }
    });
}
