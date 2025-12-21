/**
 * Logic to filter and prioritize files for RAG indexing
 */

export interface SelectedFile {
    path: string;
    priority: 'high' | 'medium' | 'low';
    type: 'readme' | 'config' | 'code' | 'docs';
}

const IGNORE_PATTERNS = [
    'node_modules',
    'dist',
    'build',
    '.git',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store',
    '.env',
    '.next',
    'coverage',
    'test',
    '__tests__',
    'public/images',
    'public/fonts',
];

const IGNORE_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.mp4', '.mov', '.avi',
    '.pdf', '.zip', '.tar', '.gz',
    '.map', '.min.js', '.min.css',
];

export function selectFilesToIndex(filePaths: string[]): SelectedFile[] {
    const selected: SelectedFile[] = [];

    for (const path of filePaths) {
        // 1. Basic Filtering
        if (IGNORE_PATTERNS.some(pattern => path.includes(pattern))) continue;
        if (IGNORE_EXTENSIONS.some(ext => path.endsWith(ext))) continue;

        // 2. Prioritization Logic
        const lowerPath = path.toLowerCase();

        // High Priority: Documentation & Critical Config
        if (lowerPath === 'readme.md') {
            selected.push({ path, priority: 'high', type: 'readme' });
            continue;
        }
        if (lowerPath === 'package.json') {
            selected.push({ path, priority: 'high', type: 'config' });
            continue;
        }

        // Medium Priority: Source Code & Configs
        if (lowerPath.startsWith('src/') || lowerPath.startsWith('app/') || lowerPath.startsWith('lib/')) {
            // Cap the depth or number of files if needed, for now accept src
            if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.jsx')) {
                selected.push({ path, priority: 'medium', type: 'code' });
                continue;
            }
        }

        // Config files in root
        if (path.includes('config') && (path.endsWith('.ts') || path.endsWith('.js') || path.endsWith('.json'))) {
            selected.push({ path, priority: 'medium', type: 'config' });
            continue;
        }

        // Low Priority: Other potentially useful files
        if (path.endsWith('.md')) {
            selected.push({ path, priority: 'low', type: 'docs' });
            continue;
        }
    }

    // Limit the number of files per repo to avoid token overload (e.g., top 50 files)
    // Priority sort: high > medium > low
    selected.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
    });

    return selected.slice(0, 50);
}
