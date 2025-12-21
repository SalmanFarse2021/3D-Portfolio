'use client';

import { useState } from 'react';

interface ProjectCard {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    githubLink: string;
    websiteLink?: string;
    architecture?: string;
    highlights?: string[];
    challenges?: string[];
    learnings?: string[];
}

export default function ProjectGeneratorPage() {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<ProjectCard[]>([]);
    const [error, setError] = useState('');
    const [adminKey, setAdminKey] = useState('');

    const handleGenerate = async () => {
        if (!adminKey) {
            setError('Please enter admin key');
            return;
        }

        setLoading(true);
        setError('');
        setProjects([]);

        try {
            const response = await fetch('/api/projects/generate', {
                method: 'POST',
                headers: {
                    'x-admin-key': adminKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Generation failed');
            }

            const data = await response.json();
            setProjects(data.projects);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const json = JSON.stringify(projects, null, 2);
        navigator.clipboard.writeText(json);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    Project Cards Generator
                </h1>

                <div className="glass-effect p-6 rounded-xl mb-8">
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Admin Key</label>
                        <input
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="Enter your admin key"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? 'Generating...' : 'Generate Project Cards'}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}
                </div>

                {projects.length > 0 && (
                    <div className="glass-effect p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">
                                Generated {projects.length} Projects
                            </h2>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                            >
                                Copy JSON
                            </button>
                        </div>

                        <div className="space-y-6">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-dark-800/50 p-6 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                                    <p className="text-gray-300 mb-4">{project.description}</p>

                                    <div className="mb-4">
                                        <span className="text-sm text-gray-400">Technologies:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {project.architecture && (
                                        <div className="mb-4">
                                            <span className="text-sm text-gray-400">Architecture:</span>
                                            <p className="text-gray-300 mt-1">{project.architecture}</p>
                                        </div>
                                    )}

                                    {project.highlights && project.highlights.length > 0 && (
                                        <div className="mb-4">
                                            <span className="text-sm text-gray-400">Highlights:</span>
                                            <ul className="list-disc list-inside text-gray-300 mt-1">
                                                {project.highlights.map((h, i) => (
                                                    <li key={i}>{h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-4">
                                        <a
                                            href={project.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            GitHub →
                                        </a>
                                        {project.websiteLink && (
                                            <a
                                                href={project.websiteLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent-400 hover:text-accent-300 transition-colors"
                                            >
                                                Live Demo →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
