'use client';

import { useState, useEffect } from 'react';

export default function Experience() {
    const [activeTab, setActiveTab] = useState<'education' | 'experience'>('experience');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#education') {
                setActiveTab('education');
            } else if (hash === '#experience') {
                setActiveTab('experience');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
            institution: "University Center, UTA",
            role: "Crew Lead",
            period: "May 2024 - Current",
            description: "Leading a team of 20+ staff to organize and execute high-profile university events, ensuring smooth and timely operations. Overseeing logistics, staffing, scheduling, and on-site coordination to deliver seamless experiences for diverse campus activities.",
            link: undefined
        },
        {
            institution: "HK Signature",
            role: "Founder & CEO",
            period: "May 2023 - Present",
            description: "Founded an AI-driven custom clothing brand allowing users to design apparel and receive automated, dynamic pricing. Leading a team of 10 while managing all technical operations, including full website development and maintenance. Built the end-to-end product pipeline—from AI design generation to order fulfillment—ensuring a smooth and scalable customer experience.",
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

    const data = activeTab === 'education' ? education : workExperience;

    return (
        <section id="qualifications" className="py-12 bg-gray-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Education & <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Experience</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        My academic background and professional journey, highlighting my path in software engineering and AI.
                    </p>

                    {/* Selection Buttons */}
                    <div className="flex justify-center gap-6 mb-8">
                        <button
                            onClick={() => setActiveTab('education')}
                            className={`group relative flex items-center gap-3 px-8 py-3 rounded-full transition-all duration-300 font-medium text-sm tracking-wide ${activeTab === 'education'
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 scale-105 ring-2 ring-primary-400/50'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-white/5 hover:border-white/20 backdrop-blur-sm'
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-colors ${activeTab === 'education' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            EDUCATION
                        </button>

                        <button
                            onClick={() => setActiveTab('experience')}
                            className={`group relative flex items-center gap-3 px-8 py-3 rounded-full transition-all duration-300 font-medium text-sm tracking-wide ${activeTab === 'experience'
                                ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-500/25 scale-105 ring-2 ring-accent-400/50'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-white/5 hover:border-white/20 backdrop-blur-sm'
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-colors ${activeTab === 'experience' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            EXPERIENCE
                        </button>
                    </div>
                </div>

                <div className="relative">
                    {/* Vertical Gradient Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500/20 via-purple-500/20 to-accent-500/20 rounded-full hidden md:block">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary-500 via-purple-500 to-accent-500 opacity-30 blur-sm" />
                    </div>

                    <div className="space-y-6">
                        {data.map((item, idx) => (
                            <div key={idx} className={`flex flex-col md:flex-row gap-6 items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''} group perspective`}>
                                {/* Content Card */}
                                <div className="w-full md:w-1/2">
                                    <div className="relative p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 group-hover:bg-gray-800/60">
                                        {/* Decorative Corner Gradient */}
                                        <div className="absolute -top-px -right-px w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Timeline Dot (Mobile) */}
                                        <div className="md:hidden absolute -left-3 top-8 w-6 h-6 rounded-full border-4 border-gray-900 bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20" />

                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 relative z-10">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-400 group-hover:to-accent-400 transition-all duration-300">
                                                    {item.role}
                                                </h3>
                                                <h4 className="text-lg text-primary-400 font-medium mt-1 flex items-center gap-2">
                                                    {item.link ? (
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-accent-400 transition-colors inline-flex items-center gap-2"
                                                        >
                                                            {item.institution}
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    ) : (
                                                        item.institution
                                                    )}
                                                </h4>
                                            </div>
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap group-hover:border-primary-500/30 group-hover:bg-primary-500/10 group-hover:text-primary-300 transition-all duration-300">
                                                {item.period}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-400 leading-relaxed relative z-10">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Timeline Node (Desktop) */}
                                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-12 h-12">
                                    <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-primary-500 relative z-10 group-hover:scale-150 transition-transform duration-500">
                                        <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
                                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                                    </div>
                                    {/* Connecting Line Effect */}
                                    <div className={`absolute top-1/2 w-12 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent transition-all duration-500 ${idx % 2 === 0 ? '-right-6 origin-left scale-x-0 group-hover:scale-x-100' : '-left-6 origin-right scale-x-0 group-hover:scale-x-100'}`} />
                                </div>

                                {/* Spacer */}
                                <div className="w-full md:w-1/2 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
