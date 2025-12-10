import { Project } from '@/types/project';
import Image from 'next/image';

interface ProjectCardProps {
    project: Project;
    onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <article
            className="group glass-effect rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl animate-fade-in flex flex-col h-full cursor-pointer"
            onClick={onClick}
        >
            {/* Project Image */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-800 shrink-0">
                {project.image ? (
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 z-10" />
            </div>

            {/* Project Info */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                    {project.title}
                </h3>

                <p className="mb-4 text-sm text-gray-300 line-clamp-2">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                        <span
                            key={index}
                            className="rounded-full bg-primary-500/20 px-3 py-1 text-xs text-primary-300"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 4 && (
                        <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-400">
                            +{project.technologies.length - 4}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    {/* GitHub */}
                    <a
                        href={project.githubLink || project.link || '#'}
                        target={project.githubLink || project.link ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${project.githubLink || project.link
                            ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-gray-600'
                            : 'bg-gray-800/50 text-gray-500 border-gray-800 cursor-not-allowed'
                            }`}
                        onClick={(e) => !(project.githubLink || project.link) && e.preventDefault()}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Code
                    </a>

                    {/* Website */}
                    <a
                        href={project.websiteLink || '#'}
                        target={project.websiteLink ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${project.websiteLink
                            ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-gray-600'
                            : 'bg-gray-800/50 text-gray-500 border-gray-800 cursor-not-allowed'
                            }`}
                        onClick={(e) => !project.websiteLink && e.preventDefault()}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Demo
                    </a>

                    {/* Ask AI */}
                    <button
                        onClick={() => {
                            const event = new CustomEvent('open-ai-chat', {
                                detail: {
                                    message: `Tell me more about the project "${project.title}". It's described as: ${project.description}. Technologies used: ${project.technologies.join(', ')}.`
                                }
                            });
                            window.dispatchEvent(event);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:scale-105 border border-white/10 group/ask"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover/ask:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Ask
                    </button>
                </div>
            </div>
        </article>
    );
}
