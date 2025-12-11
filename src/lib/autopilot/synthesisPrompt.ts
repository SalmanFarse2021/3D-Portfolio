export const SYNTHESIS_PROMPT_TEMPLATE = `
You are given an array "analyses[]" where each element is the JSON produced by the per-file analysis. Use these to generate the following artifacts for repo {{repo_owner}}/{{repo_name}}:

Required outputs (return a single JSON object with the keys below):
{
  "readme_md": string,           // Full README.md in markdown
  "short_description": string,   // 1-2 sentence elevator pitch
  "features": [string],          // bullet list of core features
  "tech_stack": [string],        // inferred tech stack and why (short)
  "setup_instructions": string,  // step-by-step to run locally (assume typical Node/Python)
  "api_documentation_md": string,// full API documentation in markdown (if any)
  "architecture_md": string,     // architecture overview and data flow (text, include PlantUML if helpful)
  "resume_bullets": [string],    // 3 technical bullets suitable for a resume
  "roadmap": [string],           // 5 prioritized next steps for the project
  "security_summary": string     // short summary of security flags found
}

Guidelines:
1. Deduplicate repeated content from multiple chunks.
2. If API endpoints were detected, list each endpoint, method, path, params, and example request/response.
3. If a README already exists in the repo, read its summary from analyses[] and incorporate improvements; do not discard author’s intent.
4. For setup_instructions, include env var placeholders and a note: "DO NOT commit secrets".
5. Keep readme_md professional, with sections: Title, Badge(s), Overview, Features, Tech stack, Installation, Usage, API, Contributing, License, Roadmap.
6. Return only valid JSON (no extra commentary).
`;

export interface SynthesisResult {
    readme_md: string;
    short_description: string;
    features: string[];
    tech_stack: string[];
    setup_instructions: string;
    api_documentation_md: string;
    architecture_md: string;
    resume_bullets: string[];
    roadmap: string[];
    security_summary: string;
}
