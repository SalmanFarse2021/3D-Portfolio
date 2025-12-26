import { withCache } from './cache';
import { getReadme, getRepoTree } from './github';

/**
 * RepoCache: Specialized caching layer for Repository Intelligence.
 * Extends the basic cache to handle compound data like "Repo Summaries".
 */

export interface RepoSummary {
    readme: string | null;
    structure: string[];
    // We could add 'technologies' derived from package.json here
}

export async function getRepoSummary(owner: string, repo: string): Promise<RepoSummary> {
    const cacheKey = `repo-summary-${owner}-${repo}`;

    return withCache(cacheKey, async () => {
        const [readme, structure] = await Promise.all([
            getReadme(owner, repo),
            getRepoTree(owner, repo, 'main') // Default to main
        ]);

        return {
            readme,
            structure
        };
    });
}

/**
 * Check if we have a valid cache for a repo
 */
export function hasCachedRepo(owner: string, repo: string): boolean {
    // This function is tricky with the wrapper-based 'withCache' which doesn't expose 'has'.
    // For now we'll rely on the fact that 'getRepoSummary' is fast if cached.
    return false; // Not implemented without modifying cache.ts
}
