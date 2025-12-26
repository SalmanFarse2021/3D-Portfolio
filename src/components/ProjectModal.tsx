import { Project } from '@/types/project';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
    const { openChatWithQuery } = useChat();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Use images array if available, otherwise fallback to single image
    const displayImages = project.images && project.images.length > 0
        ? project.images
        : (project.image ? [project.image] : []);

    // Reset index when project changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [project]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayImages.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayImages.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
        }
    };
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent scroll on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-gray-800">
                {/* Header Image */}
                <div className="relative h-64 sm:h-80 w-full shrink-0 group/image">
                    {displayImages.length > 0 ? (
                        <>
                            <Image
                                key={displayImages[currentIndex]}
                                src={displayImages[currentIndex]}
                                alt={project.title}
                                fill
                                className="object-cover transition-opacity duration-300 cursor-zoom-in"
                                onClick={() => setIsLightboxOpen(true)}
                            />

                            {/* Navigation Buttons (Only if multiple images) */}
                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110 z-10"
                                        title="Previous Image"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110 z-10"
                                        title="Next Image"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {displayImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
                            <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md z-20 group"
                        title="Minimize/Close"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-medium border border-primary-500/20">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-800">
                            <a
                                href={project.githubLink || project.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${project.githubLink || project.link
                                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 hover:shadow-lg'
                                    : 'bg-gray-800/50 text-gray-500 border border-gray-800 cursor-not-allowed'
                                    }`}
                                onClick={(e) => !(project.githubLink || project.link) && e.preventDefault()}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                View Code
                            </a>

                            <a
                                href={project.websiteLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${project.websiteLink
                                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 hover:shadow-lg'
                                    : 'bg-gray-800/50 text-gray-500 border border-gray-800 cursor-not-allowed'
                                    }`}
                                onClick={(e) => !project.websiteLink && e.preventDefault()}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                Live Demo
                            </a>

                            <button
                                onClick={() => {
                                    // Extract repo name
                                    let repoName = undefined;
                                    if (project.githubLink) {
                                        const parts = project.githubLink.split('/');
                                        repoName = parts[parts.length - 1];
                                    }

                                    openChatWithQuery(`Tell me more about the project "${project.title}"`, repoName);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:scale-105 border border-white/10 ml-auto"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Ask AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Lightbox / Full Screen View */ }
    {
        isLightboxOpen && (
            <div
                className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in p-4"
                onClick={() => setIsLightboxOpen(false)}
            >
                <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50 pointer-events-auto"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <Image
                            src={displayImages[currentIndex]}
                            alt={project.title}
                            fill
                            className="object-contain"
                            quality={100}
                            priority
                        />
                    </div>
                </div>
            </div>
        )
    }
        </div >
    );
}
