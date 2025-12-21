import { Octokit } from 'octokit';

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
    }[];
}

const octokit = process.env.GITHUB_TOKEN
    ? new Octokit({ auth: process.env.GITHUB_TOKEN })
    : null;

export async function fetchGitHubData(): Promise<GitHubData | null> {
    if (!octokit) {
        console.warn('GITHUB_TOKEN is not set. Skipping GitHub data fetch.');
        return null;
    }

    try {
        // Fetch authenticated user profile
        const { data: profile } = await octokit.rest.users.getAuthenticated();

        // Fetch repositories (sorted by updated)
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 10,
            type: 'owner', // Only repos owned by the user
        });

        // Transform data
        const repositories = repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stargazers_count: repo.stargazers_count || 0,
            updated_at: repo.updated_at,
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
}
