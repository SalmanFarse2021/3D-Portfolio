'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface Citation {
    repo: string;
    path: string;
    url: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
}

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your Portfolio Assistant. Ask me anything about the code and projects!",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [explainMode, setExplainMode] = useState(false);
    const [width, setWidth] = useState(384); // 24rem = 384px (w-96)
    const [isResizing, setIsResizing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant') {
            // For assistant messages (answers), aligns the top of the message to the top of the view
            // consistent with "start and stop at the start of the answer"
            setTimeout(() => {
                lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            // For user messages, scroll to bottom as usual
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom]);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatHistory');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }
    }, []);

    // Save history to localStorage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
    }, [messages]);

    const handleClearChat = () => {
        if (confirm('Are you sure you want to clear the conversation history?')) {
            const initialMessage: Message[] = [{
                role: 'assistant',
                content: "Hi! I'm your Portfolio Assistant. Ask me anything about the code and projects!",
            }];
            setMessages(initialMessage);
            localStorage.removeItem('chatHistory');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            let response: Response | undefined;
            let data: any;

            if (explainMode) {
                // Parse input for explain mode: "owner/repo/path" or just ask for clarification
                const match = userMessage.match(/([\w-]+)\/([\w-]+)\/(.+)/);
                if (match) {
                    const [, owner, repo, path] = match;
                    response = await fetch('/api/explain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ owner, repo, path }),
                    });
                    data = await response.json();

                    if (data.error) throw new Error(data.error);

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `## Code Explanation: ${data.metadata.file}\n\n${data.explanation}`,
                        citations: [{ repo: data.metadata.repo, path: data.metadata.file, url: data.metadata.url }]
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Please specify the file in format: `owner/repo/path/to/file.ts`\n\nExample: `SalmanFarse2021/AiSocial/src/lib/github.ts`',
                    }]);
                }
            } else {
                // Normal RAG chat mode
                // Use sessionId from localStorage or generate new
                let sessionId = localStorage.getItem('chatSessionId');
                if (!sessionId) {
                    sessionId = crypto.randomUUID();
                    localStorage.setItem('chatSessionId', sessionId);
                }

                response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-conversation-id': sessionId
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        conversationId: sessionId
                    }),
                });

                // Store returned conversation ID if updated
                const returnedId = response.headers.get('x-conversation-id');
                if (returnedId) {
                    localStorage.setItem('chatSessionId', returnedId);
                }

                data = await response.json();

                if (data.error) throw new Error(data.error);

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    citations: data.citations
                }]);
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX - 24; // 24px = right-6
        setWidth(Math.max(320, Math.min(800, newWidth))); // Min 320px, Max 800px
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResizing]);

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg transition-all hover:scale-110 animate-glow"
                aria-label="Toggle AI chat"
            >
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 max-w-[calc(100vw-3rem)] animate-slide-up"
                    style={{ width: `${width}px` }}
                >
                    <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px] relative">
                        {/* Resize Handle */}
                        <div
                            onMouseDown={handleMouseDown}
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-primary-400/20 hover:bg-primary-400/50 transition-colors z-10"
                            title="Drag to resize"
                            style={{ touchAction: 'none' }}
                        />
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/80">
                                        {explainMode ? 'Explain Code Mode' : 'Portfolio Assistant'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleClearChat}
                                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                        title="Clear history"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setExplainMode(!explainMode)}
                                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white transition-colors"
                                        title="Toggle mode"
                                    >
                                        {explainMode ? '💬 Chat' : '🔍 Explain'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-scroll overflow-x-hidden space-y-4 bg-gray-900/50 p-0"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    .flex-1.overflow-y-scroll::-webkit-scrollbar {
                                        width: 0px !important;
                                        height: 0px !important;
                                        display: none !important;
                                    }
                                    .flex-1.overflow-y-scroll {
                                        scrollbar-width: none !important;
                                        -ms-overflow-style: none !important;
                                    }
                                    /* Force code wrapping and hide overflow */
                                    .prose {
                                        max-width: 100% !important;
                                        overflow-x: hidden !important;
                                        word-break: break-word !important;
                                        overflow-wrap: anywhere !important;
                                    }
                                    .prose pre {
                                        white-space: pre-wrap !important;
                                        word-wrap: break-word !important;
                                        overflow-x: hidden !important;
                                        max-width: 100% !important;
                                        padding: 1rem !important;
                                        background-color: rgb(17, 24, 39) !important; /* bg-gray-900 */
                                        border-radius: 0.5rem !important;
                                    }
                                    .prose code {
                                        white-space: pre-wrap !important;
                                        word-break: break-all !important;
                                        overflow-wrap: break-word !important;
                                    }
                                    /* Ensure links don't overflow */
                                    .prose a {
                                        word-break: break-all !important;
                                    }
                                `
                            }} />
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    ref={index === messages.length - 1 ? lastMessageRef : null}
                                    className="flex flex-col w-full overflow-hidden"
                                >
                                    <div
                                        className={`rounded-none px-3 py-2 w-full ${message.role === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-800 text-gray-100'
                                            }`}
                                        style={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            maxWidth: '100%'
                                        }}
                                    >
                                        <div className="text-sm prose prose-invert max-w-none break-words w-full" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Citations */}
                                    {message.citations && message.citations.length > 0 && (
                                        <div className="mt-2 w-full space-y-1">
                                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sources:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {message.citations.map((cite, i) => (
                                                    <a
                                                        key={i}
                                                        href={cite.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-gray-800 border border-gray-700 hover:border-primary-500 hover:text-primary-400 text-gray-300 px-2 py-1 rounded transition-colors truncate max-w-full"
                                                        title={`${cite.repo}/${cite.path}`}
                                                    >
                                                        {cite.path.split('/').pop()}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start">
                                    <div className="bg-gray-800 rounded-lg px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="border-t border-gray-700 p-2 bg-gray-900/50 shrink-0"
                        >
                            <div className="flex gap-2">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    placeholder="Ask about this code..."
                                    className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-[42px] min-h-[42px] max-h-32 scrollbar-none"
                                    disabled={isLoading}
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed h-[42px] flex items-center justify-center"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
