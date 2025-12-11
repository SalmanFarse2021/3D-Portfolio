'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIChatSidebar() {
    const initialMessages: { role: 'user' | 'ai', content: string }[] = [
        { role: 'ai', content: "Hello! I am Salman Farse's personal assistant. How can I help you today?" }
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>(initialMessages);
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

    const [isFloating, setIsFloating] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
        }
    }, [input]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isFloating) return; // Only drag when floating
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y
        };
    };

    const handleMinimize = () => {
        setIsOpen(false);
    };

    const handleCancel = () => {
        setMessages(initialMessages);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: dragRef.current.startPosX + dx,
                y: dragRef.current.startPosY + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <>
            {/* Toggle Button */}
            {showTrigger && !isOpen && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="relative group">
                        {/* Pinging Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200 animate-pulse"></div>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl border border-white/10 flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12 overflow-hidden"
                            aria-label="Open AI Chat"
                        >
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Icon: Sparkles */}
                            <svg className="w-7 h-7 text-indigo-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </button>

                        {/* Tooltip */}
                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
                            Ask AI Assistant
                            {/* Arrow */}
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 border-t border-r border-white/10 transform rotate-45"></div>
                        </span>
                    </div>

                </div>
            )}

            {/* Chat Container */}
            <div
                className={`fixed z-40 bg-gray-900 border border-gray-700 shadow-2xl flex flex-col 
                    ${isDragging ? 'transition-none' : 'transition-all duration-300'}
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    ${isFloating
                        ? 'bottom-24 right-6 w-96 h-[600px] max-h-[70vh] rounded-2xl cursor-move'
                        : 'top-16 right-0 h-[calc(100vh-4rem)] w-80 md:w-96 border-t-0 border-b-0'
                    }`}
                style={{
                    transform: isFloating ? `translate(${position.x}px, ${position.y}px)` : 'none'
                }}
            >
                {/* Header */}
                <div
                    className={`p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 backdrop-blur-sm select-none ${isFloating ? 'rounded-t-2xl' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h3 className="font-bold text-white">AI Assistant</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Move Button */}
                        <button
                            onClick={() => setIsFloating(!isFloating)}
                            className={`text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full ${isFloating ? 'text-primary-400' : ''}`}
                            aria-label={isFloating ? "Dock to Sidebar" : "Float Window"}
                            title={isFloating ? "Dock to Sidebar" : "Float Window"}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {isFloating ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            )}
                        </button>

                        {/* Minimize Button */}
                        <button
                            onClick={handleMinimize}
                            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                            aria-label="Minimize chat"
                            title="Minimize"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>

                        {/* Cancel (Close) Button */}
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-700 rounded-full"
                            aria-label="End chat"
                            title="End Chat"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                }`}>
                                {msg.role === 'ai' ? (
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="text-primary-400 font-bold" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li {...props} />,
                                            a: ({ node, ...props }) => <a className="text-primary-400 underline hover:text-primary-300" target="_blank" rel="noopener noreferrer" {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
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
                <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm rounded-b-2xl">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
                            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700 placeholder-gray-500 transition-all resize-none overflow-hidden min-h-[44px] max-h-[100px]"
                            style={{ lineHeight: '1.5' }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/20 mb-[1px]"
                            aria-label="Send message"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
