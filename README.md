# 3D AI Portfolio

A high-performance interactive portfolio featuring 3D graphics and a RAG-powered AI assistant that can answer questions about your code.

## 🛠 Tech Stack
**Next.js 14**, **TypeScript**, **Tailwind CSS**, **React Three Fiber**, **OpenAI (GPT-5.1)**, **Supabase (pgvector)**

## 🚀 Key Features
- **RAG Chatbot**: "Talk to my code" - indexes GitHub repos for technical Q&A.
- **3D Hero**: Interactive floating geometry.
- **Live GitHub**: Real-time stats and repo fetching.
- **Smart Indexing**: Admin dashboard to ingest codebase knowledge.

## ⚡️ Quick Start

1. **Clone & Install**
   ```bash
   git clone [repo-url]
   npm install
   ```

2. **Configure Environment** (`.env.local`)
   ```env
   OPENAI_API_KEY=sk-...
   GITHUB_TOKEN=ghp_...
   VECTOR_DB_URL=https://...
   VECTOR_DB_KEY=...
   ```

3. **Run**
   ```bash
   npm run dev
   ```

## 🧠 Indexing Code for Chat
Go to `/admin/index` and enter your API key to build the vector database.
