
// import fetch from 'node-fetch'; // Global fetch in newer Node

const BASE_URL = 'http://localhost:3000/api/chat';

async function chat(message: string, conversationId?: string) {
    console.log(`\n--- Sending Message: "${message}" ---`);
    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, conversationId })
        });

        const conversationIdHeader = res.headers.get('x-conversation-id');
        const text = await res.text();

        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            console.log(`Bot: ${text.slice(0, 100)}...`);
        } else {
            console.log(`Bot Error Body: ${text.slice(0, 500)}`);
        }
        console.log(`ConvID: ${conversationIdHeader}`);

        return conversationIdHeader;
    } catch (e) {
        console.error("Fetch failed:", e);
        return null;
    }
}

async function runTest() {
    console.log("=== STARTING CHAT BOT TEST ===");

    // 1. Initial Greeting
    let convId = await chat("Hi, I'm a recruiter.", undefined);

    if (!convId) {
        console.error("Failed to get conversation ID! Aborting.");
        return;
    }

    // 2. Context Setting - Fintrion
    // await chat("Tell me about Fintrion.", convId);

    // 3. Website Check - Assuming Fintrion has a link or we can test with a generic one
    // Note: Fintrion in projects.json doesn't seem to have a websiteLink in the snippet I saw earlier? 
    // Let's check HK Signature or Doctor.ai which I saw had links.

    await chat("What is on the Doctor.ai live website?", convId);

    console.log("=== TEST COMPLETE ===");
}

runTest();
