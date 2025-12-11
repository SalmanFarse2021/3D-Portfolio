export const GIT_PROMPT_TEMPLATE = `
Given repo {{repo_owner}}/{{repo_name}} and generated files list:
files_changed = [ {{files_list}} ]

Produce JSON:
{
  "branch_name": string,        // e.g., "autodoc/2025-12-10"
  "commit_message": string,     // short
  "pr_title": string,
  "pr_body_md": string          // explain what was generated, list files, include "How to review" steps
}

Rules:
- Branch name must be safe for git (lowercase, dashes).
- pr_body_md must include: summary, critical items to review, security note, and next steps.
- Return ONLY JSON.
`;

export interface GitResult {
    branch_name: string;
    commit_message: string;
    pr_title: string;
    pr_body_md: string;
}
