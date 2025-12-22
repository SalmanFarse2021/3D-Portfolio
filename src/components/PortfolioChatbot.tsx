'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/context/ChatContext';

const SUGGESTED_QUESTIONS = [
    "What is Doctor.ai?",
    "Explain the AiSocial architecture",
    "Show me the tech stack",
    "How does the ingestion script work?",
    "Tell me about your experience"
];

export default function PortfolioChatbot() {
    const { isOpen, setIsOpen, initialQuery, initialRepoFilter, clearInitialQuery } = useChat();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, citations?: any[] }[]>([
        { role: 'ai', content: "Hi! I'm Salman's AI assistant. Ask me anything about his projects, skills, or experience!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTrigger, setShowTrigger] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [mode, setMode] = useState<'general' | 'recruiter' | 'tech'>('general');
    const [activeRepoFilter, setActiveRepoFilter] = useState<string | undefined>(undefined);

    // Dragging State
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const timer = setTimeout(() => setShowTrigger(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Handle initial query from context
    useEffect(() => {
        if (isOpen && initialQuery) {
            setInput(initialQuery);
            if (initialRepoFilter) {
                setActiveRepoFilter(initialRepoFilter);
            }
            if (!isOpen) setIsOpen(true);

            // Auto-submit the query
            handleSubmit(null, initialQuery, initialRepoFilter || undefined);
            clearInitialQuery();
        }
    }, [isOpen, initialQuery, initialRepoFilter]);

    const handleSuggestedClick = (question: string) => {
        setInput(question);
        // Optional: auto-submit
        // handleSubmit(null, question); 
    };

    const handleSubmit = async (e: React.FormEvent | null, textOverride?: string, repoFilterOverride?: string) => {
        if (e) e.preventDefault();
        const textEx = textOverride || input;
        const repoEx = repoFilterOverride || activeRepoFilter;

        if (!textEx.trim()) return;

        const userMsg = textEx.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    conversationId: conversationId || undefined,
                    mode,
                    repoFilter: repoEx
                })
            });

            const newConvId = res.headers.get('x-conversation-id');
            if (newConvId && newConvId !== conversationId) {
                setConversationId(newConvId);
            }

            if (!res.ok) throw new Error(res.statusText);
            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            let citations: any[] = [];

            const sourcesHeader = res.headers.get('x-citations');
            if (sourcesHeader) {
                try {
                    citations = JSON.parse(sourcesHeader);
                } catch (e) {
                    console.error('Failed to parse citations', e);
                }
            }

            setMessages(prev => [...prev, { role: 'ai', content: '', citations }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;

                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    const others = prev.slice(0, -1);
                    return [...others, { ...last, content: aiResponse }];
                });
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setMessages([
            { role: 'ai', content: "Hi! I'm Salman's AI assistant. Ask me anything about his projects, skills, or experience!" }
        ]);
        setConversationId(null);
        setIsOpen(false);
        setPosition(null); // Reset position on close
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    // -- Drag Logic --
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!chatWindowRef.current) return;
        setIsDragging(true);

        // Calculate offset from the top-left of the window
        const rect = chatWindowRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent text selection

            // Calculate new position
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;

            // Boundary checks (keep roughly on screen)
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const chatW = chatWindowRef.current?.offsetWidth || 400;
            const chatH = chatWindowRef.current?.offsetHeight || 600;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + chatW > winW) newX = winW - chatW;
            if (newY + chatH > winH) newY = winH - chatH;

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    return (
        <>
            {/* Toggle Button */}
            {showTrigger && !isOpen && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200 animate-pulse"></div>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl border border-white/10 flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12 overflow-hidden"
                            aria-label="Open AI Chat"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            <div
                ref={chatWindowRef}
                style={position ? {
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'none',
                    bottom: 'auto',
                    right: 'auto'
                } : {}}
                className={`fixed z-50 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none translate-y-8'
                    } ${!position ? 'bottom-6 right-4' : ''}`}
            >
                <div className="bg-gray-950/95 w-[90vw] md:w-[400px] rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col h-[600px] max-h-[80vh] overflow-hidden backdrop-blur-xl">

                    {/* Header (Draggable) */}
                    <div
                        onMouseDown={handleMouseDown}
                        className="p-4 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center select-none cursor-move active:cursor-grabbing"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm tracking-wide">Salman&apos;s Assistant</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Powered by GPT-4o & RAG</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-full"
                                title="Reset Chat"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="px-4 py-3 bg-gray-900/30 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5" onMouseDown={e => e.stopPropagation()}>
                        {(['general', 'recruiter', 'tech'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${mode === m
                                    ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                                    }`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" onMouseDown={e => e.stopPropagation()}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-gray-800/80 text-gray-200 rounded-tl-sm border border-gray-700/50'
                                    }`}>
                                    {msg.role === 'ai' ? (
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800/50 prose-code:text-primary-300">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => <a className="text-primary-400 hover:underline underline-offset-2 decoration-primary-400/30" target="_blank" rel="noopener noreferrer" {...props} />,
                                                    code: ({ node, ...props }) => <code className="bg-gray-900 px-1 py-0.5 rounded text-xs font-mono text-primary-300" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>

                                {/* Citations below AI message */}
                                {msg.role === 'ai' && msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-2 ml-1 flex flex-wrap gap-2 max-w-[85%]">
                                        {msg.citations.map((cite: any, i: number) => (
                                            <a
                                                key={i}
                                                href={cite.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-[10px] bg-gray-900/40 hover:bg-gray-800 text-gray-400 hover:text-primary-300 border border-gray-800 px-2 py-1 rounded-full transition-all group"
                                            >
                                                <svg className="w-3 h-3 text-gray-600 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <span className="truncate max-w-[120px]">{cite.repo}/{cite.path.split('/').pop()}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Suggested Questions (Only show when 1 message - the greeting) */}
                        {messages.length === 1 && (
                            <div className="grid grid-cols-1 gap-2 mt-4 px-2">
                                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider ml-1">Suggested Questions</p>
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestedClick(q)}
                                        className="text-left text-xs bg-gray-800/40 hover:bg-gray-800 text-gray-300 border border-gray-700/50 hover:border-primary-500/30 p-2.5 rounded-lg transition-all active:scale-[0.98]"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-gray-800/80 rounded-2xl rounded-tl-sm p-4 text-sm border border-gray-700/50 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur-md" onMouseDown={e => e.stopPropagation()}>
                        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Ask about projects..."
                                rows={1}
                                className="flex-1 bg-gray-800/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 border border-gray-700 placeholder-gray-500 transition-all resize-none overflow-hidden min-h-[44px] max-h-[120px]"
                                style={{ lineHeight: '1.5' }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-gradient-to-br from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/20 active:scale-95"
                                aria-label="Send message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
