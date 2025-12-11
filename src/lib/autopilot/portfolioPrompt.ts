export const PORTFOLIO_PROMPT_TEMPLATE = `
You are given an array portfolio_repos[] where each item is:
{
  "repo_owner": string,
  "repo_name": string,
  "repo_url": string,
  "readme_md": string,         // from previous repo synthesis step
  "short_description": string,
  "tech_stack": [string],
  "resume_bullets": [string],
  "primary_language": string,
  "last_updated": string
}

Produce a single JSON object with keys:
{
  "portfolio_index_md": string,        // a Markdown project index listing all repos with 1-sentence summary, tech tags, and CTA link
  "detailed_entries": [                // for each repo a site-ready card content
    {
      "repo_name": string,
      "title": string,
      "hero_sentence": string,
      "short_description": string,
      "tech_stack": [string],
      "resume_bullets": [string],
      "readme_excerpt": string,       // top ~200 chars from readme_md or generated highlight
      "demo_instructions": string,    // if available
      "repo_url": string,
      "last_updated": string
    }
  ],
  "portfolio_readme_md": string        // longer page for portfolio site with sections: About, Projects, Contact
}

Guidelines:
- Order projects by last_updated (most recent first).
- For each project, generate a 1-line "hero_sentence" describing impact or main feature.
- Keep each field concise and web-ready.
- Return JSON only.
`;

export interface PortfolioResult {
    portfolio_index_md: string;
    detailed_entries: Array<{
        repo_name: string;
        title: string;
        hero_sentence: string;
        short_description: string;
        tech_stack: string[];
        resume_bullets: string[];
        readme_excerpt: string;
        demo_instructions: string;
        repo_url: string;
        last_updated: string;
    }>;
    portfolio_readme_md: string;
}
