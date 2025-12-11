export const ANALYSIS_PROMPT_TEMPLATE = `
Analyze the following code file chunk. Return ONLY valid JSON matching the schema below.

Input:
- repo: {{repo_owner}}/{{repo_name}}
- file_path: {{file_path}}
- file_chunk_index: {{chunk_index}}  // 0-based
- total_chunks_for_file: {{total_chunks}}
- language_hint: {{language}}
- content: '''{{file_text}}'''

Schema (strict JSON):
{
  "file_path": string,
  "chunk_index": integer,
  "total_chunks": integer,
  "summary": string,                    // 1-3 sentences about this chunk's purpose
  "exports": [                          // functions/classes/exports detected in this chunk
    { "name": string, "type": string, "description": string }
  ],
  "detected_routes": [                  // if Express, Flask, FastAPI etc detected
    { "method": string, "path": string, "handler": string }
  ],
  "dependencies": [string],             // notable imports or packages
  "security_flags": [                   // list of potential secrets or risky patterns
    { "type": string, "line": integer, "explanation": string }
  ],
  "test_suggestions": [string],         // short unit/integration test ideas
  "todo_notes": [string]                // actionable TODO items
}

Assistant must:
- produce valid JSON only (no commentary).
- if nothing is found for a field, return an empty array or empty string as appropriate.
- do not include file contents in response.
`;

export interface AnalysisResult {
    file_path: string;
    chunk_index: number;
    total_chunks: number;
    summary: string;
    exports: Array<{ name: string; type: string; description: string }>;
    detected_routes: Array<{ method: string; path: string; handler: string }>;
    dependencies: string[];
    security_flags: Array<{ type: string; line: number; explanation: string }>;
    test_suggestions: string[];
    todo_notes: string[];
}
