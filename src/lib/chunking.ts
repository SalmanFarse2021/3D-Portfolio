/**
 * Split text into semantic chunks for RAG
 */

export interface Chunk {
    content: string;
    index: number;
    metadata: {
        repo: string;
        path: string;
        type: string;
        chunkIndex: number;
    };
}

const CHUNK_SIZE = 1500; // Characters roughly
const CHUNK_OVERLAP = 200;

function cleanText(text: string): string {
    // Remove binary markers or confusing characters
    return text
        .replace(/\u0000/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/[^\x20-\x7E\n\t]/g, '') // Keep minimal ASCII printables + whitespace
        .trim();
}

export function chunkFile(
    repo: string,
    path: string,
    content: string,
    type: string
): Chunk[] {
    const cleaned = cleanText(content);
    const chunks: Chunk[] = [];

    let start = 0;
    let chunkIndex = 0;

    while (start < cleaned.length) {
        let end = start + CHUNK_SIZE;

        // Try to find a natural break point (newline > space) if we are not at the end
        if (end < cleaned.length) {
            const lastNewLine = cleaned.lastIndexOf('\n', end);
            const lastSpace = cleaned.lastIndexOf(' ', end);

            if (lastNewLine > start + CHUNK_SIZE * 0.8) {
                end = lastNewLine;
            } else if (lastSpace > start + CHUNK_SIZE * 0.8) {
                end = lastSpace;
            }
        }

        const chunkContent = cleaned.substring(start, end).trim();

        if (chunkContent.length > 50) { // filter tiny chunks
            chunks.push({
                content: chunkContent,
                index: chunkIndex,
                metadata: {
                    repo,
                    path,
                    type,
                    chunkIndex,
                },
            });
            chunkIndex++;
        }

        start = end - CHUNK_OVERLAP;
        // Make sure we progress even if overlap > chunk size (unlikely)
        if (start >= end) start = end;
    }

    return chunks;
}
