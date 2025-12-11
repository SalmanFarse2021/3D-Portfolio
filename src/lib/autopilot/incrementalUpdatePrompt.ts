export const INCREMENTAL_UPDATE_PROMPT_TEMPLATE = `
We are updating docs for repository {{repo_owner}}/{{repo_name}}. Provided: changed_analyses[] (same schema as per-file analysis).
Task: produce an incremental README patch summary and list which README sections to update.
Return JSON:
{
  "readme_patch_md": string,     // Markdown diff-style content or replacement sections
  "sections_to_update": [string] // e.g., ["API", "Installation"]
}
`;

export interface IncrementalUpdateResult {
    readme_patch_md: string;
    sections_to_update: string[];
}
