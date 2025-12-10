'use client';

import { useState, useRef } from 'react';
import { getProjects } from '@/lib/projectUtils';
import { Project } from '@/types/project';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function ProjectGrid() {
    const allProjects = getProjects();
    const [visibleCount, setVisibleCount] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    const visibleProjects = allProjects.slice(0, visibleCount);
    const hasMore = visibleCount < allProjects.length;

    const scrollToButtons = () => {
        setTimeout(() => {
            buttonContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    const handleLoadMore = () => {
        setIsLoading(true);

        // Simulate loading delay for better UX
        setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 4, allProjects.length));
            setIsLoading(false);
            scrollToButtons();
        }, 300);
    };

    const handleShowLess = () => {
        setVisibleCount(prev => Math.max(prev - 4, 4));
        scrollToButtons();
    };

    return (
        <section id="projects" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-20">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                        Featured <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Projects</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Explore my latest work in web development, 3D experiences, and AI integration
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => setSelectedProject(project)}
                        />
                    ))}
                </div>

                {/* Project Modal */}
                {selectedProject && (
                    <ProjectModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}

                {/* Navigation Buttons */}
                <div ref={buttonContainerRef} className="mt-12 flex justify-center gap-4">
                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="group relative overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-white transition-all hover:bg-primary-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                <span>See More</span>
                            )}
                        </button>
                    )}

                    {visibleCount > 4 && (
                        <button
                            onClick={handleShowLess}
                            disabled={isLoading}
                            className="group relative overflow-hidden rounded-lg border border-primary-600/50 bg-transparent px-8 py-3 text-primary-400 transition-all hover:bg-primary-600/10 hover:border-primary-600 hover:text-primary-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            See Less
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
