
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import projectsData from '../src/data/projects.json';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGODB_URI;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!MONGO_URI || !OPENAI_KEY) {
    console.error("Missing MONGODB_URI or OPENAI_API_KEY");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });
const client = new MongoClient(MONGO_URI);

// --- Data Content (Extracted from Components) ---

const ABOUT_CONTENT = `
Hello, I'm Salman Farse. Software & AI Engineer.
AI + Full-Stack | Cloud | Distributed Systems.
I’m a Software & AI Engineer specializing in full-stack development, intelligent systems, and real-time AI integration.
I blend clean engineering with cutting-edge machine learning to build fast, scalable, and impactful digital experiences.
Contact Email: salmanfarse2021@gmail.com
Socials: LinkedIn, GitHub, Instagram.
`;

const SKILLS_CONTENT = `
Languages: Python, C, C++, C#, Java, JavaScript, TypeScript, Kotlin, Swift, SQL, NoSQL.
Frameworks: React, Next.js, Node.js, Express.js, Three.js, Django, ASP.NET, Spring Boot, React Native.
Cloud & Tools: AWS, Azure, Docker, Databricks, Terraform, Supabase, Cloudflare, Firebase, Postman, Git.
AI/ML: TensorFlow, OpenCV, Gemini API, OpenAI API, DeepAI, Random Forest, OCR, LLM Integration.
Databases: MongoDB, PostgreSQL, SQLite, Microsoft SQL Server.
`;

const EXPERIENCE_CONTENT = `
Education:
- The University of Texas at Arlington: B.S. Computer Science (Honors), Expected May 2027. Relevant Coursework: Data Structures & Algorithms, Operating Systems, OOP, Discrete Structures, Calculus III, Computer Architecture.
- Shahid A. H. M Kamaruzzaman Govt. Degree College: Higher Secondary Certificate (Science), Jul 2019 - Dec 2021.
- Harimohan Government High School: Secondary School Certificate (Science), Jan 2013 - Mar 2019.

Work Experience:
- Personal Projects (Software + AI Engineer), Oct 2023 - Current: Designed and built multiple production-quality systems including AiSocial, HK Signature, Generative AI Studio. Architected scalable full-stack solutions with React/Next.js, Node.js, Gemini, Hugging Face.
- HK Signature (Founder & CEO), Aug 2025 - Present: Founded an AI-driven custom clothing brand. Leading a team of 10. Built end-to-end product pipeline.
- University Center, UTA (Crew Lead), May 2024 - Current: Leading a team of 20+ staff for university events.
- High School Math Club (Founder, President), Jan 2020 - Dec 2021: Organized weekly problem-solving sessions.
`;

// --- Helpers ---

async function getEmbedding(text: string) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
    } catch (e) {
        console.error("Embedding error:", e);
        return null;
    }
}

function chunkText(text: string, size = 1000, overlap = 100) {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        chunks.push(text.slice(start, end));
        start += size - overlap;
    }
    return chunks;
}

// --- Main ---

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('3d_portfolio');
        const collection = db.collection('code_embeddings');

        const documents: any[] = [];

        // 1. Process Projects
        console.log("Processing Projects...");
        for (const project of projectsData) {
            const content = `
Project: ${project.title}
Description: ${project.description}
Technologies: ${project.technologies.join(', ')}
Links: GitHub (${project.githubLink}), Website (${project.websiteLink || 'N/A'})
            `.trim();

            const embedding = await getEmbedding(content);
            if (embedding) {
                documents.push({
                    content,
                    embedding,
                    repo: "portfolio-content",
                    path: `projects/${project.id}`,
                    url: project.websiteLink || project.githubLink || "",
                    type: "project",
                    chunk_index: 0,
                    created_at: new Date()
                });
            }
        }

        // 2. Process About
        console.log("Processing About...");
        const aboutChunks = chunkText(ABOUT_CONTENT);
        for (let i = 0; i < aboutChunks.length; i++) {
            const embedding = await getEmbedding(aboutChunks[i]);
            if (embedding) {
                documents.push({
                    content: aboutChunks[i],
                    embedding,
                    repo: "portfolio-content",
                    path: "about",
                    url: "/#about",
                    type: "about",
                    chunk_index: i,
                    created_at: new Date()
                });
            }
        }

        // 3. Process Skills
        console.log("Processing Skills...");
        const skillsEmbedding = await getEmbedding(SKILLS_CONTENT);
        if (skillsEmbedding) {
            documents.push({
                content: SKILLS_CONTENT,
                embedding: skillsEmbedding,
                repo: "portfolio-content",
                path: "skills",
                url: "/#skills",
                type: "skills",
                chunk_index: 0,
                created_at: new Date()
            });
        }

        // 4. Process Experience
        console.log("Processing Experience...");
        const expChunks = chunkText(EXPERIENCE_CONTENT);
        for (let i = 0; i < expChunks.length; i++) {
            const embedding = await getEmbedding(expChunks[i]);
            if (embedding) {
                documents.push({
                    content: expChunks[i],
                    embedding,
                    repo: "portfolio-content",
                    path: "experience",
                    url: "/#qualifications",
                    type: "experience",
                    chunk_index: i,
                    created_at: new Date()
                });
            }
        }

        // Upsert
        if (documents.length > 0) {
            console.log(`Upserting ${documents.length} documents...`);
            // Delete old content for this repo to avoid duplicates
            await collection.deleteMany({ repo: "portfolio-content" });
            await collection.insertMany(documents);
            console.log("Ingestion Complete!");
        } else {
            console.log("No documents to insert.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

main();
