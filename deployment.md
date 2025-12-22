# Deployment Checklist (Vercel)

## 1. Environment Variables
Add these to your Vercel Project Settings (Settings -> Environment Variables).

| Variable Name | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | API Key for OpenAI (Embeddings & Chat). |
| `MONGODB_URI` | ✅ Yes | Connection string for MongoDB Atlas (with Vector Search). |
| `GITHUB_TOKEN` | ⚠️ Rec. | GitHub PAT for high-limit repo ingestion (keep private). |
| `CHAT_RATE_LIMIT_PER_MIN` | ❌ Opt | Max chats per IP/min. Default: 20. |
| `TOP_K` | ❌ Opt | Number of RAG chunks to retrieve. Default: 10. |

> **Note**: Do NOT add `NEXT_PUBLIC_` to these unless you explicitly want them exposed to the client (none of the above should be exposed).

## 2. Build Settings
Vercel should auto-detect Next.js, but verify:
- **Build Command**: `next build` (or `npm run build`)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

## 3. MongoDB Atlas Search Index
Ensure you have created the Vector Search Index in your Atlas cluster.
- **Database**: `3d_portfolio`
- **Collection**: `code_embeddings`
- **Index Name**: `vector_index`
- **Definition**:
```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "repo",
      "type": "filter"
    }
  ]
}
```

## 4. Ingestion (Production)
Since your app is static/hybrid, the content ingestion happens **Offline** (via your scripts), not at runtime.
1. Run `npx tsx scripts/ingest-website.ts` locally (or in CI/CD) to populate DB.
2. Run `npx tsx scripts/ingest-github.ts` locally (or in CI/CD) to populate code.
3. The deployed Vercel app will simply *read* from this pre-populated MongoDB.

## 5. Verification Plan
After deployment URL is live:
1. **Health Check**: Open the site, ensure Chat Widget appears.
2. **Chat Test**: Ask "Who is Salman?" (Tests OpenAI + basic flow).
3. **RAG Test**: Ask "How does the ingestion script work?" (Tests MongoDB connection + Vectors).
4. **Mode Test**: Switch to "Tech Mode" and ask about Architecture.

## 6. Vercel Edge / Serverless
- The current implementation uses **Serverless Functions** (Node.js runtime) for `/api/chat` to support MongoDB connections (which aren't fully Edge-compatible without Data API).
- This is the correct, stable default for Vercel. No special `runtime = 'edge'` config is needed for this setup.

## 7. Render.com (Alternative)
If you deploy here instead:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Env Vars**: Same as above.
