import { Message } from './chatMemory';
import clientPromise from '@/lib/mongodb';

// Re-using the Message type from chatMemory to minimize friction
export type ChatRole = 'user' | 'assistant' | 'system' | 'function';

export interface ChatMessage {
    role: ChatRole;
    content: string | null;
    name?: string;
    function_call?: any;
    timestamp?: number;
}

interface SessionData {
    _id: string; // sessionId
    messages: ChatMessage[];
    lastAccessed: number;
    activeRepo?: string | null;
}

const DB_NAME = '3d_portfolio';
const COLLECTION_NAME = 'chat_sessions';

class MemoryStore {
    private readonly MAX_HISTORY = 12; // Keep last 12 messages
    private localCache: Map<string, SessionData> = new Map();

    /**
     * Get conversation history for a session
     */
    async getHistory(sessionId: string): Promise<ChatMessage[]> {
        try {
            const client = await clientPromise;
            const db = client.db(DB_NAME);
            const collection = db.collection<SessionData>(COLLECTION_NAME);

            const session = await collection.findOne({ _id: sessionId });

            if (session) {
                // Async update last accessed (fire and forget to speed up read)
                collection.updateOne(
                    { _id: sessionId },
                    { $set: { lastAccessed: Date.now() } }
                ).catch(err => console.error('Failed to update lastAccessed:', err));

                // Sync to local cache just in case
                this.localCache.set(sessionId, session);
                return session.messages || [];
            }
        } catch (error) {
            console.error('Error fetching chat history from DB, checking local cache:', error);
        }

        // Fallback to local cache
        const localSession = this.localCache.get(sessionId);
        if (localSession) {
            return localSession.messages || [];
        }

        return [];
    }

    /**
     * Add a message turn to the session with automatic pruning
     */
    async addTurn(sessionId: string, role: ChatRole, content: string | null, extra?: Partial<ChatMessage>): Promise<void> {
        // Truncate content to prevent massive context build-up
        if (content && content.length > 20000) {
            content = content.slice(0, 20000) + '...[TRUNCATED]';
        }

        const message: ChatMessage = {
            role,
            content,
            timestamp: Date.now(),
            ...extra
        };

        // 1. Update Local Cache (Immediate Fallback)
        const existingSession = this.localCache.get(sessionId) || {
            _id: sessionId,
            messages: [],
            lastAccessed: Date.now(),
            activeRepo: null
        };

        const updatedMessages = [...existingSession.messages, message].slice(-this.MAX_HISTORY);
        this.localCache.set(sessionId, {
            ...existingSession,
            messages: updatedMessages,
            lastAccessed: Date.now()
        });

        // 2. Try DB Update
        try {
            const client = await clientPromise;
            const db = client.db(DB_NAME);
            const collection = db.collection<SessionData>(COLLECTION_NAME);

            // Upsert session, append message, and keep only the last MAX_HISTORY messages
            await collection.updateOne(
                { _id: sessionId },
                {
                    $push: {
                        messages: {
                            $each: [message],
                            $slice: -this.MAX_HISTORY
                        }
                    },
                    $set: { lastAccessed: Date.now() },
                    $setOnInsert: { activeRepo: null }
                },
                { upsert: true }
            );
        } catch (error) {
            console.error('Error adding chat turn to DB (using local cache only):', error);
        }
    }

    async getActiveRepo(sessionId: string): Promise<string | null> {
        try {
            const client = await clientPromise;
            const db = client.db(DB_NAME);
            const collection = db.collection<SessionData>(COLLECTION_NAME);

            const session = await collection.findOne({ _id: sessionId }, { projection: { activeRepo: 1 } });
            if (session) {
                // Sync local
                const cached = this.localCache.get(sessionId);
                if (cached) {
                    cached.activeRepo = session.activeRepo;
                    this.localCache.set(sessionId, cached);
                }
                return session.activeRepo || null;
            }
        } catch (error) {
            console.error('Error getting active repo form DB:', error);
        }

        // Fallback
        const cached = this.localCache.get(sessionId);
        return cached?.activeRepo || null;
    }

    async setActiveRepo(sessionId: string, repo: string | null): Promise<void> {
        // 1. Update Local
        const cached = this.localCache.get(sessionId);
        if (cached) {
            cached.activeRepo = repo;
            cached.lastAccessed = Date.now();
            this.localCache.set(sessionId, cached);
        } else {
            this.localCache.set(sessionId, {
                _id: sessionId,
                messages: [],
                lastAccessed: Date.now(),
                activeRepo: repo
            });
        }

        // 2. Try DB
        try {
            const client = await clientPromise;
            const db = client.db(DB_NAME);
            const collection = db.collection<SessionData>(COLLECTION_NAME);

            await collection.updateOne(
                { _id: sessionId },
                {
                    $set: {
                        activeRepo: repo,
                        lastAccessed: Date.now()
                    }
                },
                { upsert: true }
            );
        } catch (error) {
            console.error('Error setting active repo in DB:', error);
        }
    }
}

export const memoryStore = new MemoryStore();
