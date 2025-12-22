'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    openChatWithQuery: (query: string, repoFilter?: string) => void;
    initialQuery: string | null;
    initialRepoFilter: string | null;
    clearInitialQuery: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState<string | null>(null);
    const [initialRepoFilter, setInitialRepoFilter] = useState<string | null>(null);

    const openChatWithQuery = (query: string, repoFilter?: string) => {
        setInitialQuery(query);
        if (repoFilter) setInitialRepoFilter(repoFilter);
        setIsOpen(true);
    };

    const clearInitialQuery = () => {
        setInitialQuery(null);
        setInitialRepoFilter(null);
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, openChatWithQuery, initialQuery, initialRepoFilter, clearInitialQuery }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
