'use client';

import { useState } from 'react';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: '#home', label: 'Home' },
        { href: '#skills', label: 'Skills' },
        { href: '#qualifications', label: 'Qualifications' },
        { href: '#projects', label: 'Projects' },
        { href: '#contact', label: 'Contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <a href="#home" className="text-2xl font-bold text-white">
                        <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            Salman Farse
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 transition-colors hover:text-primary-400"
                            >
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700 hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            Resume
                        </a>
                    </div>


                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-effect">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-primary-400"
                            >
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2 rounded-lg px-3 py-2 text-primary-400 font-semibold transition-colors hover:bg-white/10"
                        >
                            Resume
                        </a>
                    </div>

                </div>
            )}
        </nav>
    );
}
