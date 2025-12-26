import { memoryStore, ChatMessage } from '@/lib/memoryStore';

/**
 * Construct the full message array for the LLM
 */
export async function buildMessages(
    sessionId: string,
    systemPrompt: string,
    contextBlock: string | null
): Promise<any[]> {
    // 1. Fetch recent history
    const history = await memoryStore.getHistory(sessionId);

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
