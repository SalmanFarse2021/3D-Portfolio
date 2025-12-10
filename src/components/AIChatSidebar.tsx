'use client';

import { useState, useEffect, useRef } from 'react';

export default function AIChatSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hello! I can tell you more about these projects. What would you like to know?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsOpen(true);
            if (customEvent.detail?.message) {
                const msg = customEvent.detail.message;
                setMessages(prev => [...prev, { role: 'user', content: msg }]);
                setIsLoading(true);
                fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                })
                    .then(res => res.json())
                    .then(data => {
                        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
                        setIsLoading(false);
                    })
                    .catch(() => {
                        setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
                        setIsLoading(false);
                    });
            }
        };

        window.addEventListener('open-ai-chat', handleOpenChat);
        return () => window.removeEventListener('open-ai-chat', handleOpenChat);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const [showTrigger, setShowTrigger] = useState(true);

    return (
        <>
            {/* Toggle Button */}
            {showTrigger && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gray-800 text-white p-3 rounded-l-xl shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'} hover:bg-gray-700 border-l border-t border-b border-gray-700`}
                    aria-label="Toggle AI Chat"
                >
                    {/* Dismiss Button */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTrigger(false);
                        }}
                        className="absolute -left-2 -top-2 bg-gray-700 text-gray-300 rounded-full p-1 shadow-md hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100"
                        title="Remove chat button"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <span className="writing-vertical-rl text-sm font-bold tracking-wider flex items-center gap-2">
                        <span className="rotate-90 text-lg">✨</span> AI CHAT
                    </span>
                </button>
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-900 border-l border-gray-800 z-40 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            <h3 className="font-bold text-white">AI Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                            aria-label="Close sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 text-sm text-gray-400 border border-gray-700 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about projects..."
                                className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700 placeholder-gray-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/20"
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
