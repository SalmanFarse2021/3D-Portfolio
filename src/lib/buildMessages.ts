import { memoryStore, ChatMessage } from '@/lib/memoryStore';

/**
 * Construct the full message array for the LLM
 */
export async function buildMessages(
    sessionId: string,
    systemPrompt: string,
    contextBlock: string | null,
    clientHistory?: any[] // Optional stateless history from client
): Promise<any[]> {
    // 1. Fetch recent history
    // If clientHistory is provided, use it (stateless mode). Otherwise fallback to DB/Memory (stateful mode)
    let history: any[] = [];

    if (clientHistory && clientHistory.length > 0) {
        history = clientHistory.slice(-10); // Use last 10 messages from client to be safe to token limits
    } else {
        history = await memoryStore.getHistory(sessionId);
    }

    // 2. Prepare System Message
    // We append the context block to the system prompt or as a separate system component
    const fullSystemContent = contextBlock
        ? `${systemPrompt}\n\n=== RETRIEVED CONTEXT ===\n${contextBlock}`
        : systemPrompt;

    const messages = [
        { role: 'system', content: fullSystemContent },
        ...history.map(m => ({
            role: m.role,
            content: m.content || "",
            name: m.name,
            function_call: m.function_call
        }))
    ];

    return messages;
}
