import fs from 'fs';
import path from 'path';
import { Autopilot } from '../src/lib/autopilot/core';
import { GitHubServiceImpl, GeminiServiceImpl } from '../src/lib/autopilot/services';

// Helper to load env
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/GEMINI_API_KEY=(.*)/);
            if (match) return match[1].trim();
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
    return process.env.GEMINI_API_KEY;
}

async function main() {
    const repoUrl = process.argv[2];
    if (!repoUrl) {
        console.error('Usage: npx tsx scripts/run-autopilot.ts <github_repo_url>');
        process.exit(1);
    }

    const apiKey = loadEnv();
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }

    console.log(`Initializing Autopilot for: ${repoUrl}`);

    const github = new GitHubServiceImpl();
    const ai = new GeminiServiceImpl(apiKey);
    const autopilot = new Autopilot(github, ai);

    try {
        const result = await autopilot.processRepository(repoUrl);

        // Output results
        const outputDir = path.join(process.cwd(), 'autopilot_output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const repoName = repoUrl.split('/').pop() || 'repo';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(outputDir, `${repoName}_${timestamp}.json`);

        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`\nAnalysis complete! Results saved to: ${outputPath}`);
        console.log('\n--- Short Description ---');
        console.log(result.short_description);
        console.log('\n--- Tech Stack ---');
        console.log(result.tech_stack.join(', '));

    } catch (error) {
        console.error('Autopilot failed:', error);
        process.exit(1);
    }
}

main();
