'use client';

export default function Skills() {
    const skills = [
        {
            category: "Languages",
            items: ["Python", "C", "C++", "C#", "Java", "JavaScript", "TypeScript", "Kotlin", "Swift", "SQL", "NoSQL"]
        },
        {
            category: "Frameworks",
            items: ["React", "Next.js", "Node.js", "Express.js", "Three.js", "Django", "ASP.NET", "Spring Boot", "React Native"]
        },
        {
            category: "Cloud & Tools",
            items: ["AWS", "Azure", "Docker", "Databricks", "Terraform", "Supabase", "Cloudflare", "Firebase", "Postman", "Git"]
        },
        {
            category: "AI/ML",
            items: ["TensorFlow", "OpenCV", "Gemini API", "OpenAI API", "DeepAI", "Random Forest", "OCR", "LLM Integration"]
        },
        {
            category: "Databases",
            items: ["MongoDB", "PostgreSQL", "SQLite", "Microsoft SQL Server"]
        }
    ];

    return (
        <section id="skills" className="py-20 bg-gray-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Technical <span className="text-primary-400">Skills</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A comprehensive toolkit for building modern, scalable, and interactive web applications.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {skills.map((category, idx) => (
                        <div
                            key={idx}
                            className="glass-effect p-8 rounded-2xl hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-primary-500/50"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                                {category.category}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {category.items.map((skill, skillIdx) => (
                                    <span
                                        key={skillIdx}
                                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium border border-gray-700 hover:text-white hover:border-primary-500 transition-colors cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
