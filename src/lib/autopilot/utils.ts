import { AUTOPILOT_CONFIG } from './config';

export interface FileChunk {
    filePath: string;
    chunkIndex: number;
    totalChunks: number;
    content: string;
}

/**
 * Checks if a file should be processed based on its path and extension.
 */
export function shouldProcessFile(filePath: string): boolean {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];

    // Check ignored directories
    if (parts.some(part => AUTOPILOT_CONFIG.IGNORE_DIRS.includes(part))) {
        return false;
    }

    // Check specific config files that are always allowed
    if (['package.json', 'requirements.txt', 'Dockerfile', 'README.md', '.env.example'].includes(fileName)) {
        return true;
    }

    // Check extension
    const extension = fileName.includes('.') ? `.${fileName.split('.').pop()}` : fileName;
    if (AUTOPILOT_CONFIG.IGNORE_EXTENSIONS.includes(extension)) {
        return false;
    }

    return AUTOPILOT_CONFIG.ALLOWED_EXTENSIONS.includes(extension);
}

/**
 * Splits file content into chunks based on configured chunk size.
 */
export function chunkFileContent(filePath: string, content: string): FileChunk[] {
    if (content.length > AUTOPILOT_CONFIG.MAX_FILE_SIZE) {
        // For very large files, take only the header/top part
        return [{
            filePath,
            chunkIndex: 0,
            totalChunks: 1,
            content: `[LARGE_FILE_SKIPPED] Summary of first ${AUTOPILOT_CONFIG.CHUNK_SIZE} chars:\n${content.substring(0, AUTOPILOT_CONFIG.CHUNK_SIZE)}`
        }];
    }

    const chunks: FileChunk[] = [];
    const totalChunks = Math.ceil(content.length / AUTOPILOT_CONFIG.CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * AUTOPILOT_CONFIG.CHUNK_SIZE;
        const end = Math.min(start + AUTOPILOT_CONFIG.CHUNK_SIZE, content.length);
        chunks.push({
            filePath,
            chunkIndex: i,
            totalChunks,
            content: content.substring(start, end)
        });
    }

    return chunks;
}

/**
 * Scans content for potential secrets and returns true if found.
 */
export function containsSecrets(content: string): boolean {
    for (const pattern of AUTOPILOT_CONFIG.SECRET_PATTERNS) {
        if (pattern.test(content)) {
            return true;
        }
    }
    return false;
}

/**
 * Redacts secrets from content (basic implementation).
 */
export function redactSecrets(content: string): string {
    let redacted = content;
    for (const pattern of AUTOPILOT_CONFIG.SECRET_PATTERNS) {
        redacted = redacted.replace(pattern, '[REDACTED_SECRET]');
    }
    return redacted;
}
