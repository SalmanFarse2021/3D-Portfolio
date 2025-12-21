import { z } from 'zod';

const envSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
    VECTOR_DB_URL: z.string().url("VECTOR_DB_URL must be a valid URL").optional(),
    VECTOR_DB_KEY: z.string().min(1, "VECTOR_DB_KEY is optional but recommended for RAG").optional(),
});

export const env = envSchema.parse(process.env);
