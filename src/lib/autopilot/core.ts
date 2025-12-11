import { AUTOPILOT_CONFIG } from './config';
import { shouldProcessFile, chunkFileContent, containsSecrets, redactSecrets, FileChunk } from './utils';
import { ANALYSIS_PROMPT_TEMPLATE, AnalysisResult } from './analysisPrompt';
import { SYNTHESIS_PROMPT_TEMPLATE, SynthesisResult } from './synthesisPrompt';
import { PORTFOLIO_PROMPT_TEMPLATE, PortfolioResult } from './portfolioPrompt';
import { GIT_PROMPT_TEMPLATE, GitResult } from './gitPrompt';
import { BATCH_ANALYSIS_PROMPT_TEMPLATE } from './batchPrompt';

// Placeholder for external services
interface GitHubService {
    fetchRepoTree(repoUrl: string): Promise<string[]>;
    fetchFileContent(repoUrl: string, filePath: string): Promise<string>;
    createBranch(repoUrl: string, branchName: string): Promise<void>;
    commitAndPush(repoUrl: string, branchName: string, message: string, files: Record<string, string>): Promise<void>;
    createPullRequest(repoUrl: string, title: string, body: string, head: string, base: string): Promise<string>;
}

interface AIService {
    generateContent(prompt: string): Promise<string>;
}

export class Autopilot {
    constructor(
        private github: GitHubService,
        private ai: AIService
    ) { }

    /**
     * Main entry point: Process a single repository.
     */
    async processRepository(repoUrl: string): Promise<SynthesisResult> {
        console.log(`Starting Autopilot for ${repoUrl}...`);

        // 1. Fetch Repo Tree
        const allFiles = await this.github.fetchRepoTree(repoUrl);
        const filesToProcess = allFiles.filter(shouldProcessFile);
        console.log(`Found ${filesToProcess.length} files to process.`);

        // 2. Read and Chunk Files
        let allChunks: FileChunk[] = [];
        for (const filePath of filesToProcess) {
            const content = await this.github.fetchFileContent(repoUrl, filePath);

            // Safety Check
            if (containsSecrets(content) && !filePath.endsWith('README.md') && !filePath.endsWith('.env.example')) {
                console.warn(`Skipping ${filePath}: Secrets detected.`);
                continue;
            }

            const chunks = chunkFileContent(filePath, content);
            allChunks.push(...chunks);
        }
        console.log(`Generated ${allChunks.length} chunks.`);

        // 3. Analyze Chunks (Batch Processing)
        const analyses = await this.analyzeChunksBatched(allChunks);
        console.log(`Completed analysis for ${analyses.length} chunks.`);

        // 4. Synthesize Repo Documentation
        const synthesis = await this.synthesizeRepo(repoUrl, analyses);
        console.log('Repo synthesis complete.');

        return synthesis;
    }

    /**
     * Batch process chunks to reduce API calls.
     */
    private async analyzeChunksBatched(chunks: FileChunk[]): Promise<AnalysisResult[]> {
        const results: AnalysisResult[] = [];

        for (let i = 0; i < chunks.length; i += AUTOPILOT_CONFIG.BATCH_SIZE) {
            // Rate limiting delay
            if (i > 0) {
                console.log('Waiting 4s to respect rate limits...');
                await new Promise(resolve => setTimeout(resolve, 4000));
            }

            const batch = chunks.slice(i, i + AUTOPILOT_CONFIG.BATCH_SIZE);
            const prompt = BATCH_ANALYSIS_PROMPT_TEMPLATE.replace('{{chunks_json}}', JSON.stringify(batch));

            try {
                const response = await this.ai.generateContent(prompt);
                const batchResults = JSON.parse(response) as AnalysisResult[];
                results.push(...batchResults);
            } catch (error) {
                console.error('Batch analysis failed:', error);
                // Fallback: Try individual processing or skip
            }
        }

        return results;
    }

    /**
     * Synthesize all analyses into final documentation.
     */
    private async synthesizeRepo(repoUrl: string, analyses: AnalysisResult[]): Promise<SynthesisResult> {
        const [owner, name] = repoUrl.split('/').slice(-2);
        const prompt = SYNTHESIS_PROMPT_TEMPLATE
            .replace('{{repo_owner}}', owner)
            .replace('{{repo_name}}', name)
            .replace('{{analyses_json}}', JSON.stringify(analyses)); // Note: Template needs this placeholder

        const response = await this.ai.generateContent(prompt);
        return JSON.parse(response) as SynthesisResult;
    }

    /**
     * Generate Git artifacts (Branch, Commit, PR).
     */
    async generateGitArtifacts(repoUrl: string, generatedFiles: string[]): Promise<GitResult> {
        const [owner, name] = repoUrl.split('/').slice(-2);
        const prompt = GIT_PROMPT_TEMPLATE
            .replace('{{repo_owner}}', owner)
            .replace('{{repo_name}}', name)
            .replace('{{files_list}}', JSON.stringify(generatedFiles));

        const response = await this.ai.generateContent(prompt);
        return JSON.parse(response) as GitResult;
    }

    /**
     * Update Portfolio Index with multiple repos.
     */
    async updatePortfolio(repos: any[]): Promise<PortfolioResult> {
        const prompt = PORTFOLIO_PROMPT_TEMPLATE.replace('{{portfolio_repos}}', JSON.stringify(repos));
        const response = await this.ai.generateContent(prompt);
        return JSON.parse(response) as PortfolioResult;
    }
}
