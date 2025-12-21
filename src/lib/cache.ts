/**
 * Simple in-memory cache for GitHub requests
 * For production with serverless functions, consider Redis (Upstash)
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry<any>>();

export async function withCache<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const entry = cache.get(key);

    if (entry && (now - entry.timestamp < CACHE_TTL_MS)) {
        return entry.data;
    }

    // Double check if we have a stale entry but fetch fails? 
    // For now simple refresh
    try {
        const data = await fetchFn();
        if (data) {
            cache.set(key, { data, timestamp: now });
        }
        return data;
    } catch (error) {
        // Fallback to stale cache if available
        if (entry) {
            console.warn(`Fetch failed for ${key}, serving stale data.`);
            return entry.data;
        }
        throw error;
    }
}
