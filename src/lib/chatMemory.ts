export type Message = {
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string | null;
    name?: string;
    function_call?: any;
};

export interface ChatStore {
    getMessages(conversationId: string): Promise<Message[]>;
    addMessage(conversationId: string, message: Message): Promise<void>;
    clearConversation(conversationId: string): Promise<void>;
}

class InMemoryChatStore implements ChatStore {
    private store: Map<string, Message[]>;

    constructor() {
        this.store = new Map();
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        return this.store.get(conversationId) || [];
    }

    async addMessage(conversationId: string, message: Message): Promise<void> {
        const current = this.store.get(conversationId) || [];
        this.store.set(conversationId, [...current, message]);
    }

    async clearConversation(conversationId: string): Promise<void> {
        this.store.delete(conversationId);
    }
}

// Export singleton for now
export const chatMemory = new InMemoryChatStore();
