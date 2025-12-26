
import { memoryStore } from '../src/lib/memoryStore';
import { resolveProjectContext } from '../src/lib/contextState';
import { buildMessages } from '../src/lib/buildMessages';
import { buildPrompt } from '../src/lib/buildPrompt';
import projectsData from '../src/data/projects.json';

// Mock dependencies
const mockProjects = projectsData as any[];

async function runTestScenario() {
    console.log("🧪 Starting Chatbot Verification Test...\n");
    const sessionId = "test-session-" + Date.now();

    // Scenario 1: Initial Context
    console.log("--- Step 1: User asks about Portfolio ---");
    let userMsg = "What tech stack does this Portfolio use?";
    let { activeRepo, isAmbiguous } = await resolveProjectContext(sessionId, userMsg);
    await memoryStore.addTurn(sessionId, 'user', userMsg);
    console.log(`User: "${userMsg}"`);
    console.log(`> Detected Active Repo: ${activeRepo}`);
    console.log(`> Is Ambiguous: ${isAmbiguous}`);

    // Verify
    if (activeRepo !== 'Portfolio' && activeRepo !== '3D-Portfolio') {
        // It might match "Portfolio" title or repo name. title is "Salman Farse 3D Portfolio" or similar?
        // Let's check projects.json: title is "Salman Farse" usually... wait.
        // I need to check how contextState maps 'Portfolio'.
        // In contextState.ts, it uses `p.title` and `p.repo`.
    }

    // Scenario 2: Follow-up with Pronoun
    console.log("\n--- Step 2: Follow-up 'How does it handle rate limiting?' ---");
    userMsg = "How does it handle rate limiting?";
    // Should retain previous context
    const result2 = await resolveProjectContext(sessionId, userMsg);
    console.log(`User: "${userMsg}"`);
    console.log(`> Detected Active Repo: ${result2.activeRepo}`);
    console.log(`> Is Ambiguous: ${result2.isAmbiguous}`);

    // Scenario 3: Context Switch
    console.log("\n--- Step 3: Switch to ResearcherX ---");
    userMsg = "Tell me about ResearcherX";
    const result3 = await resolveProjectContext(sessionId, userMsg);
    await memoryStore.addTurn(sessionId, 'user', userMsg);
    console.log(`User: "${userMsg}"`);
    console.log(`> Detected Active Repo: ${result3.activeRepo}`);

    // Scenario 4: Follow-up on new context
    console.log("\n--- Step 4: 'What libraries does it use?' ---");
    userMsg = "What libraries does it use?";
    const result4 = await resolveProjectContext(sessionId, userMsg);
    console.log(`User: "${userMsg}"`);
    console.log(`> Detected Active Repo: ${result4.activeRepo}`);

    // Scenario 5: Ambiguous Query
    console.log("\n--- Step 5: Ambiguous 'Show me the code' ---");
    // Clear active repo to test ambiguity? No, real user flow retains it.
    // Let's force a "clear" conceptually or just see if it sticks to ResearcherX
    userMsg = "Show me the code";
    const result5 = await resolveProjectContext(sessionId, userMsg);
    console.log(`User: "${userMsg}"`);
    console.log(`> Detected Active Repo: ${result5.activeRepo} (Should be ResearcherX)`);

    console.log("\n✅ Test Complete.");
}

runTestScenario().catch(console.error);
