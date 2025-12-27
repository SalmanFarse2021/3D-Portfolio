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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleClose = () => {
        setIsOpen(false);
        // Reset state
        setMessages([
            { role: 'ai', content: "Hi! I'm Salman's AI assistant. Ask me anything about his projects, skills, or experience!" }
        ]);
        // Clear history and session
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatSessionId');
        setConversationId(null);
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

    // -- Drag Logic (Optimized with requestAnimationFrame) --
    const isDraggingRef = useRef(false);
    const animationFrameId = useRef<number>();

    // Store latest values in refs to avoid closure staleness in event listeners
    const positionRef = useRef<{ x: number, y: number } | null>(null);

    // Initialize positionRef from state or defaults
    useEffect(() => {
        if (position) positionRef.current = position;
    }, [position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!chatWindowRef.current) return;

        // Don't start dragging if clicking on a button or resize handle
        if ((e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('textarea') ||
            (e.target as HTMLElement).closest('.cursor-nw-resize') ||
            (e.target as HTMLElement).closest('.cursor-ne-resize') ||
            (e.target as HTMLElement).closest('.cursor-sw-resize') ||
            (e.target as HTMLElement).closest('.cursor-se-resize') ||
            (e.target as HTMLElement).closest('.cursor-n-resize') ||
            (e.target as HTMLElement).closest('.cursor-s-resize') ||
            (e.target as HTMLElement).closest('.cursor-e-resize') ||
            (e.target as HTMLElement).closest('.cursor-w-resize')
        ) return;

        isDraggingRef.current = true;
        setIsDragging(true); // Just for cursor style if needed, or remove to avoid re-render

        const rect = chatWindowRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // If position is null (default bottom-right), set initial position explicitly
        if (!positionRef.current) {
            positionRef.current = { x: rect.left, y: rect.top };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            e.preventDefault();

            // Calculate target position
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;

            // Boundary checks
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const chatW = chatWindowRef.current?.offsetWidth || 400;
            const chatH = chatWindowRef.current?.offsetHeight || 600;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + chatW > winW) newX = winW - chatW;
            if (newY + chatH > winH) newY = winH - chatH;

            // Direct DOM update via rAF
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

            animationFrameId.current = requestAnimationFrame(() => {
                if (chatWindowRef.current) {
                    chatWindowRef.current.style.left = `${newX}px`;
                    chatWindowRef.current.style.top = `${newY}px`;
                    chatWindowRef.current.style.bottom = 'auto'; // ensure overrides
                    chatWindowRef.current.style.right = 'auto';
                }
            });

            // Update ref for next calculation if needed, but here we just need e.client
            positionRef.current = { x: newX, y: newY };
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                setIsDragging(false);
                if (positionRef.current) {
                    setPosition(positionRef.current); // Sync state at end
                }
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    // Resizing State
    const [size, setSize] = useState<{ width: number, height: number }>({ width: 400, height: 600 });
    const resizeDirRef = useRef<string | null>(null);
    const sizeRef = useRef<{ width: number, height: number }>({ width: 400, height: 600 }); // track latest size for rAF updates
    const resizeRef = useRef<{
        startX: number,
        startY: number,
        startWidth: number,
        startHeight: number,
        startLeft: number,
        startTop: number
    }>({ startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 });

    // Sync ref
    useEffect(() => {
        sizeRef.current = size;
    }, [size]);

    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        resizeDirRef.current = direction;
        e.preventDefault();
        e.stopPropagation();

        const rect = chatWindowRef.current?.getBoundingClientRect();
        if (!rect) return;

        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: sizeRef.current.width,
            startHeight: sizeRef.current.height,
            startLeft: rect.left,
            startTop: rect.top
        };

        // Ensure we have a valid starting positionRef if it was null
        if (!positionRef.current) {
            positionRef.current = { x: rect.left, y: rect.top };
        }
    };

    useEffect(() => {
        const handleResizeMouseMove = (e: MouseEvent) => {
            if (!resizeDirRef.current) return;
            e.preventDefault();

            const dir = resizeDirRef.current;
            const deltaX = e.clientX - resizeRef.current.startX;
            const deltaY = e.clientY - resizeRef.current.startY;

            let newWidth = resizeRef.current.startWidth;
            let newHeight = resizeRef.current.startHeight;
            let newLeft = resizeRef.current.startLeft;
            let newTop = resizeRef.current.startTop;

            if (dir.includes('e')) {
                newWidth = Math.max(320, Math.min(800, resizeRef.current.startWidth + deltaX));
            }
            if (dir.includes('w')) {
                const potentialWidth = resizeRef.current.startWidth - deltaX;
                if (potentialWidth >= 320 && potentialWidth <= 800) {
                    newWidth = potentialWidth;
                    newLeft = resizeRef.current.startLeft + deltaX;
                } else if (potentialWidth < 320) {
                    newWidth = 320;
                    newLeft = resizeRef.current.startLeft + (resizeRef.current.startWidth - 320);
                } else {
                    newWidth = 800;
                    newLeft = resizeRef.current.startLeft + (resizeRef.current.startWidth - 800);
                }
            }
            if (dir.includes('s')) {
                newHeight = Math.max(400, Math.min(800, resizeRef.current.startHeight + deltaY));
            }
            if (dir.includes('n')) {
                const potentialHeight = resizeRef.current.startHeight - deltaY;
                if (potentialHeight >= 400 && potentialHeight <= 800) {
                    newHeight = potentialHeight;
                    newTop = resizeRef.current.startTop + deltaY;
                } else if (potentialHeight < 400) {
                    newHeight = 400;
                    newTop = resizeRef.current.startTop + (resizeRef.current.startHeight - 400);
                } else {
                    newHeight = 800;
                    newTop = resizeRef.current.startTop + (resizeRef.current.startHeight - 800);
                }
            }

            // Update Refs
            sizeRef.current = { width: newWidth, height: newHeight };
            if (dir.includes('w') || dir.includes('n')) {
                positionRef.current = { x: newLeft, y: newTop };
            }

            // Direct DOM update
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = requestAnimationFrame(() => {
                if (chatWindowRef.current) {
                    chatWindowRef.current.style.width = `${newWidth}px`;
                    chatWindowRef.current.style.height = `${newHeight}px`;
                    if (dir.includes('w') || dir.includes('n')) {
                        chatWindowRef.current.style.left = `${newLeft}px`;
                        chatWindowRef.current.style.top = `${newTop}px`;
                        chatWindowRef.current.style.bottom = 'auto'; // ensure overrides
                        chatWindowRef.current.style.right = 'auto';
                    }
                }
            });
        };

        const handleResizeMouseUp = () => {
            if (resizeDirRef.current) {
                resizeDirRef.current = null;
                // Sync state
                setSize(sizeRef.current);
                if (positionRef.current) {
                    setPosition(positionRef.current);
                }
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            }
        };

        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleResizeMouseMove);
            document.removeEventListener('mouseup', handleResizeMouseUp);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);



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
            {/* Chat Window */}
            <div
                ref={chatWindowRef}
                style={!isMobile ? {
                    ...(position ? {
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        transform: 'none',
                        bottom: 'auto',
                        right: 'auto'
                    } : {}),
                    width: `${size.width}px`,
                    height: `${size.height}px`
                } : {}}
                className={`fixed z-50 transition-[opacity,transform] duration-500 cubic-bezier(0.16, 1, 0.3, 1) 
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-8'}
                    ${isMobile
                        ? 'inset-x-0 bottom-0 w-full h-[85vh] rounded-t-2xl'
                        : (!position ? 'bottom-6 right-4 rounded-2xl' : 'rounded-2xl')
                    }
                `}
            >
                {/* We need to use a resize listener to disable custom inline styles on mobile */}
                <style jsx>{`
                    @media (max-width: 768px) {
                        div[ref="chatWindowRef"] {
                            width: 100% !important;
                            height: 85vh !important;
                            left: 0 !important;
                            top: auto !important;
                            bottom: 0 !important;
                            right: 0 !important;
                            transform: none !important;
                        }
                    }
                `}</style>
                <div
                    className="bg-gray-950/95 w-full h-full md:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-700/50 flex flex-col overflow-hidden backdrop-blur-xl relative"
                // Mobile: Remove borders/radius that look bad full screen
                >
                    {/* Resize Handles - Hide on Mobile */}
                    <div className="hidden md:block">
                        {/* Corners */}
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 rounded-tl-2xl"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50 rounded-tr-2xl"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50 rounded-bl-2xl"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-1 hover:bg-white/10 rounded-br-2xl transition-colors">
                            <svg className="w-3 h-3 text-gray-600 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>

                        {/* Edges */}
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'n')} className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-40"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 's')} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-40"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'w')} className="absolute top-4 bottom-4 left-0 w-2 cursor-w-resize z-40"></div>
                        <div onMouseDown={(e) => handleResizeMouseDown(e, 'e')} className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize z-40"></div>
                    </div>

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

                            </div>
                        </div>
                        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                                title="Close Chat"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                                                    a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-2 decoration-cyan-400/30 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                                    code: ({ node, ...props }) => <code className="bg-gray-950/50 px-1.5 py-0.5 rounded text-xs font-mono text-yellow-300 border border-white/5" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-violet-400" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 my-2 space-y-1 marker:text-emerald-400" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1 marker:text-emerald-400" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1 text-gray-200" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
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
