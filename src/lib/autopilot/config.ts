export const AUTOPILOT_CONFIG = {
    // File Filtering Rules
    IGNORE_DIRS: [
        'node_modules',
        '.git',
        'vendor',
        'dist',
        'build',
        'coverage',
        '.next',
        '.vscode',
        '.idea'
    ],
    IGNORE_EXTENSIONS: [
        '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', // Images
        '.mp4', '.mov', '.avi', // Videos
        '.pdf', '.doc', '.docx', // Documents
        '.zip', '.tar', '.gz', // Archives
        '.exe', '.dll', '.so', '.dylib', // Binaries
        '.lock', '-lock.json' // Lock files
    ],
    ALLOWED_EXTENSIONS: [
        '.js', '.jsx', '.ts', '.tsx', // JavaScript/TypeScript
        '.py', // Python
        '.java', // Java
        '.go', // Go
        '.rb', // Ruby
        '.php', // PHP
        '.c', '.cpp', '.h', // C/C++
        '.cs', // C#
        '.rs', // Rust
        '.swift', // Swift
        '.kt', '.kts', // Kotlin
        '.md', '.txt', // Text/Docs
        '.json', '.yaml', '.yml', '.xml', // Config
        '.html', '.css', '.scss', '.less', // Web
        '.sql', // Database
        '.sh', '.bash', '.zsh', // Shell
        'Dockerfile', 'Makefile' // Build
    ],

    // Chunking Settings
    CHUNK_SIZE: 8000, // Reduced to avoid token limits
    MAX_FILE_SIZE: 1024 * 1024, // 1MB limit for full processing

    // Batching Settings
    BATCH_SIZE: 2, // Reduced to avoid rate limits

    // Model Settings
    MODEL_NAME: 'gpt-5.1', // Long context model
    TEMPERATURE: 0.1, // Low temperature for deterministic output

    // Safety
    SECRET_PATTERNS: [
        /API_KEY/i,
        /SECRET/i,
        /PASSWORD/i,
        /TOKEN/i,
        /PRIVATE_KEY/i,
        /ghp_[a-zA-Z0-9]{36}/ // GitHub Personal Access Token
    ]
};
