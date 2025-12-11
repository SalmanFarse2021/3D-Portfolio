export const BATCH_ANALYSIS_PROMPT_TEMPLATE = `
You will receive an array chunks[] with elements {file_path, chunk_index, total_chunks, content}.
Process each and return JSON array results[] where each element follows the schema from the per-file analysis prompt below.

--- PER-FILE SCHEMA ---
{
  "file_path": string,
  "chunk_index": integer,
  "total_chunks": integer,
  "summary": string,
  "exports": [{ "name": string, "type": string, "description": string }],
  "detected_routes": [{ "method": string, "path": string, "handler": string }],
  "dependencies": [string],
  "security_flags": [{ "type": string, "line": integer, "explanation": string }],
  "test_suggestions": [string],
  "todo_notes": [string]
}
-----------------------

Input Chunks:
{{chunks_json}}

Return ONLY the JSON array results[].
`;
