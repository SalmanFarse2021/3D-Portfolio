/**
 * Simple in-memory rate limiter
 * For production, use Upstash Redis (Ratclimit)
 */

type RatelimitConfig = {
    limit: number; // Max requests
    window: number; // Time window in ms
};

const trackers = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(identifier: string, config: RatelimitConfig = { limit: 10, window: 60 * 1000 }): { success: boolean, remaining: number } {
    const now = Date.now();
    const key = identifier;
    const record = trackers.get(key);

    if (!record || now > record.expiresAt) {
        trackers.set(key, { count: 1, expiresAt: now + config.window });
        return { success: true, remaining: config.limit - 1 };
    }

    if (record.count >= config.limit) {
        return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: config.limit - record.count };
}

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of Array.from(trackers.entries())) {
        if (now > value.expiresAt) {
            trackers.delete(key);
        }
    }
}, 60 * 1000); // Check every minute
