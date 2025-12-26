'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ResumePage() {
    const education = [
        {
            institution: "The University of Texas at Arlington",
            role: "B.S. Computer Science (Honors)",
            period: "Expected May 2027",
            description: "Relevant Coursework: Data Structures & Algorithms, Operating Systems, Object-Oriented Programming, Discrete Structures, Calculus III, Computer Architecture.",
            link: "https://www.uta.edu/"
        },
        {
            institution: "Shahid A. H. M Kamaruzzaman Govt. Degree College",
            role: "Higher Secondary Certificate (Science)",
            period: "Jul 2019 - Dec 2021",
            description: "Rajshahi, Bangladesh",
            link: "https://skcr.edu.bd/"
        },
        {
            institution: "Harimohan Government High School",
            role: "Secondary School Certificate (Science)",
            period: "Jan 2013 - Mar 2019",
            description: "Chapainawabganj, Bangladesh",
            link: "http://harimohanschool.edu.bd/"
        }
    ];

    const workExperience = [
        {
            institution: "Personal Projects",
            role: "Software + AI Engineer",
            period: "Oct 2023 - Current",
            description: "Designed and built multiple production-quality, AI-driven systems including an intelligent social platform, custom-design e-commerce engine, multimodal Generative AI studio, and 3D interactive portfolio. Architected scalable full-stack solutions using React/Next.js, Node.js/Express, and cloud infrastructure, integrating advanced multimodal models (Gemini, Hugging Face FLUX, DeepAI) for real-time generation, personalization, and automation. Delivered high-impact features such as secure microservices, real-time messaging, optimized media pipelines, CSV data automation, AI-assisted content workflows, and resilient deployments—demonstrating strong engineering rigor, architectural decision-making, and end-to-end product execution.",
            link: undefined
        },
        {
            institution: "HK Signature",
            role: "Founder & CEO",
            period: "Aug 2025 - Present",
            description: "Founded an AI-driven custom clothing brand allowing users to design apparel and receive automated, dynamic pricing. Leading a team of 10 while managing all technical operations, including full website development and maintenance. Built the end-to-end product pipeline—from AI design generation to order fulfillment—ensuring a smooth and scalable customer experience.",
            link: undefined
        },
        {
            institution: "University Center, UTA",
            role: "Crew Lead",
            period: "May 2024 - Current",
            description: "Leading a team of 20+ staff to organize and execute high-profile university events, ensuring smooth and timely operations. Overseeing logistics, staffing, scheduling, and on-site coordination to deliver seamless experiences for diverse campus activities.",
            link: undefined
        },
        {
            institution: "High School Math Club",
            role: "Founder, President",
            period: "Jan 2020 - Dec 2021",
            description: "Founded and led the school's first math club. Organized weekly problem-solving sessions and inter-school competitions, growing membership to 50+ students.",
            link: undefined
        }
    ];

    const skills = {
        "Languages": ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "HTML/CSS", "SQL"],
        "Frontend": ["React", "Next.js", "Tailwind CSS", "Three.js", "Framer Motion", "Redux"],
        "Backend": ["Node.js", "Express", "FastAPI", "MongoDB", "PostgreSQL", "Firebase", "Supabase"],
        "AI/ML": ["OpenAI API", "Google Gemini", "LangChain", "Hugging Face", "TensorFlow", "RAG"],
        "Tools": ["Git", "Docker", "AWS", "Vercel", "Linux", "Postman", "Figma"]
    };

    return (
        <main className="bg-gray-900 min-h-screen text-white selection:bg-primary-500/30">
            <Navigation />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Inputs Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 animate-fade-in">
                    {/* Box 1: Your Resume */}
                    <div className="glass-effect rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-primary-400">1.</span> Your Resume (PDF)
                        </h3>
                        <div className="border-2 border-dashed border-gray-700 group-hover:border-primary-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors bg-gray-900/20">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-white font-medium mb-1">Upload a file</p>
                            <p className="text-gray-500 text-sm mb-4">No file chosen</p>
                            <p className="text-xs text-gray-500 font-mono">PDF, DOCX up to 5MB</p>
                        </div>
                    </div>

                    {/* Box 2: Target Role */}
                    <div className="glass-effect rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-accent-400">2.</span> Target Role <span className="text-gray-500 text-sm font-normal ml-auto">(Optional)</span>
                        </h3>
                        <textarea
                            className="w-full h-[180px] bg-gray-900/20 border border-gray-700 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent-500/50 resize-none transition-colors text-sm"
                            placeholder="Paste job description here..."
                        />
                    </div>
                </div>

                {/* Feature Highlights - Pushed Down */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {[
                        { icon: "🧠", title: "Semantic Analysis", desc: "Beyond keywords. We understand impact & seniority." },
                        { icon: "🎯", title: "ATS Simulation", desc: "Real-time scoring against modern tracking systems." },
                        { icon: "🔍", title: "Gap Detection", desc: "Paste a JD to see exactly what you're missing." },
                        { icon: "✨", title: "AI Rewriter", desc: "One-click polish or targeted tailoring." }
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-effect p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Header (Original Resume Content) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 animate-fade-in border-b border-gray-800 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Salman Farse</span>
                        </h1>
                        <p className="text-xl text-gray-400">Software & AI Engineer</p>
                        <div className="flex gap-4 mt-4 text-sm text-gray-400">
                            <a href="mailto:salmanfarse2021@gmail.com" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                salmanfarse2021@gmail.com
                            </a>
                            <a href="https://github.com/SalmanFarse2021" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                GitHub
                            </a>
                            <a href="https://linkedin.com/in/salmanfarse" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                LinkedIn
                            </a>
                        </div>
                    </div>

                    <a
                        href="/resume.pdf"
                        target="_blank"
                        className="mt-6 md:mt-0 flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-full font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 group"
                    >
                        Download PDF
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                </div>

                {/* Summary */}
                <div className="mb-12 animate-slide-up">
                    <h2 className="text-2xl font-bold mb-4 text-primary-400 flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary-400 rounded-full"></span>
                        Summary
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        Software & AI Engineer specializing in full-stack development, intelligent systems, and real-time AI integration.
                        I blend clean engineering with cutting-edge machine learning to build fast, scalable, and impactful digital experiences.
                        Proven track record in building complex production applications including multimodal social platforms, e-commerce engines, and generative AI tools.
                    </p>
                </div>

                {/* Technical Skills */}
                <div className="mb-12 animate-slide-up delay-100">
                    <h2 className="text-2xl font-bold mb-6 text-primary-400 flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary-400 rounded-full"></span>
                        Technical Skills
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(skills).map(([category, items]) => (
                            <div key={category} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-primary-500/30 transition-colors">
                                <h3 className="text-lg font-semibold text-white mb-3">{category}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-md border border-gray-700">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Experience */}
                <div className="mb-12 animate-slide-up delay-200">
                    <h2 className="text-2xl font-bold mb-8 text-primary-400 flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary-400 rounded-full"></span>
                        Professional Experience
                    </h2>
                    <div className="space-y-12">
                        {workExperience.map((exp, idx) => (
                            <div key={idx} className="relative pl-8 border-l border-gray-800 hover:border-primary-500/30 transition-colors">
                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                    <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                                    <span className="text-sm font-mono text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50 mt-1 sm:mt-0 w-fit">
                                        {exp.period}
                                    </span>
                                </div>
                                <div className="mb-3 text-lg text-primary-400 font-medium">{exp.institution}</div>
                                <p className="text-gray-400 leading-relaxed text-base">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className="mb-12 animate-slide-up delay-300">
                    <h2 className="text-2xl font-bold mb-8 text-primary-400 flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary-400 rounded-full"></span>
                        Education
                    </h2>
                    <div className="space-y-12">
                        {education.map((edu, idx) => (
                            <div key={idx} className="relative pl-8 border-l border-gray-800 hover:border-primary-500/30 transition-colors">
                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-accent-500 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)]"></div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                    <h3 className="text-xl font-bold text-white">{edu.role}</h3>
                                    <span className="text-sm font-mono text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50 mt-1 sm:mt-0 w-fit">
                                        {edu.period}
                                    </span>
                                </div>
                                <div className="mb-3 text-lg text-accent-400 font-medium">{edu.institution}</div>
                                <p className="text-gray-400 leading-relaxed text-base">{edu.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Download Action Footer */}
                <div className="flex justify-center mt-16 animate-fade-in delay-500">
                    <a
                        href="/resume.pdf"
                        target="_blank"
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all hover:scale-105"
                    >
                        <span className="bg-gray-800 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </span>
                        <div className="text-left">
                            <div className="font-bold text-base">Grab a copy</div>
                            <div className="text-xs text-gray-400">PDF Format (2.5 MB)</div>
                        </div>
                    </a>
                </div>
            </div>

            <Footer />
        </main>
    );
}
