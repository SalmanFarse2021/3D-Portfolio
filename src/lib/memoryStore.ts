import { Message } from './chatMemory';

// Re-using the Message type from chatMemory to minimize friction, 
// or we can redefine it here if we want to deprecate chatMemory.
export type ChatRole = 'user' | 'assistant' | 'system' | 'function';

export interface ChatMessage {
    role: ChatRole;
    content: string | null;
    name?: string;
    function_call?: any;
    timestamp?: number;
}

interface SessionData {
    messages: ChatMessage[];
    lastAccessed: number;
    activeRepo?: string | null;
}

class MemoryStore {
    private sessions: Map<string, SessionData>;
    private readonly MAX_HISTORY = 12; // Keep last 12 messages
    private readonly SESSION_TTL = 30 * 60 * 1000; // 30 minutes

    constructor() {
        this.sessions = new Map();

        // Periodic cleanup
        setInterval(() => this.cleanupSessions(), 5 * 60 * 1000); // Every 5 mins
    }

    /**
     * Get conversation history for a session
     */
    async getHistory(sessionId: string): Promise<ChatMessage[]> {
        const session = this.sessions.get(sessionId);
        if (!session) return [];

        // Update last accessed
        session.lastAccessed = Date.now();
        return session.messages;
    }

    /**
     * Add a message turn to the session
     */
    async addTurn(sessionId: string, role: ChatRole, content: string | null, extra?: Partial<ChatMessage>): Promise<void> {
        let session = this.sessions.get(sessionId);

        if (!session) {
            session = { messages: [], lastAccessed: Date.now() };
            this.sessions.set(sessionId, session);
        }

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

        session.messages.push(message);
        session.lastAccessed = Date.now();

        this.prune(sessionId);
    }

    async getActiveRepo(sessionId: string): Promise<string | null> {
        const session = this.sessions.get(sessionId);
        return session?.activeRepo || null;
    }

    async setActiveRepo(sessionId: string, repo: string | null): Promise<void> {
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = { messages: [], lastAccessed: Date.now() };
            this.sessions.set(sessionId, session);
        }
        session.activeRepo = repo;
        session.lastAccessed = Date.now();
    }

    /**
     * Prune history to keep only relevant context
     */
    private prune(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        // Keep system prompt (if we stored it, but usually we just build it per request)
        // For now, we just keep the last N messages.
        if (session.messages.length > this.MAX_HISTORY) {
            session.messages = session.messages.slice(-this.MAX_HISTORY);
        }
    }

    /**
     * Remove old sessions
     */
    private cleanupSessions(): void {
        const now = Date.now();
        for (const [id, session] of Array.from(this.sessions.entries())) {
            if (now - session.lastAccessed > this.SESSION_TTL) {
                this.sessions.delete(id);
            }
        }
    }
}

export const memoryStore = new MemoryStore();
