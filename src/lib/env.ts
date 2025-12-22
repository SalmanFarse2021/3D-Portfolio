import { z } from 'zod';

const envSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    // Legacy/Optional
    VECTOR_DB_URL: z.string().url().optional(),
    VECTOR_DB_KEY: z.string().optional(),
    CHAT_RATE_LIMIT_PER_MIN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
