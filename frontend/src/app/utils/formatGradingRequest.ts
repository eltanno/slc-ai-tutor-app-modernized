/**
 * Utility to format chat data for grading by the slc-tutor-evaluator LLM
 */

import type { ChatMessage } from "../services/Chat.api";
import type { GradingChatMetadata } from "../types/ChatMetadata";

// Re-export for backward compatibility
export type { GradingChatMetadata as ChatMetadata };

/**
 * Format chat messages and metadata into a grading request for the LLM
 * @param chatMetadata - The chat configuration (from chat1.json, etc.)
 * @param messages - The conversation messages
 * @returns Formatted user prompt for the grading LLM
 */
export function formatGradingRequest(
    chatMetadata: ChatMetadata,
    messages: ChatMessage[]
): string {
    // Format the conversation transcript, excluding system messages
    const transcriptLines: string[] = [];

    for (const msg of messages) {
        if (msg.role === 'user') {
            transcriptLines.push(`LEARNER: ${msg.content}`);
        } else if (msg.role === 'assistant') {
            transcriptLines.push(`RESIDENT: ${msg.content}`);
        } else if (msg.role === 'scenario') {
            // Include scenario messages as actions taken
            transcriptLines.push(`[ACTION TAKEN]: ${msg.content}`);
        }
        // Skip system messages
    }

    const transcript = transcriptLines.join('\n\n');

    // Create the complete grading request
    const gradingRequest = `# CHAT METADATA

\`\`\`json
${JSON.stringify(chatMetadata, null, 2)}
\`\`\`

# CONVERSATION TRANSCRIPT

${transcript}

# YOUR TASK

Please analyze this care worker training conversation and provide a comprehensive assessment following the instructions in the system prompt. Return your response as a valid JSON object.`;

    return gradingRequest;
}

/**
 * Prepare messages array for sending to the grading LLM
 * @param chatMetadata - The chat configuration
 * @param messages - The conversation messages
 * @returns Messages array ready for the LLM API
 */
export function prepareGradingMessages(
    chatMetadata: ChatMetadata,
    messages: ChatMessage[]
): Array<{ role: string; content: string }> {
    const userPrompt = formatGradingRequest(chatMetadata, messages);

    // Calculate prompt size for warning check
    const promptChars = userPrompt.length;
    const estimatedTokens = Math.ceil(promptChars / 4); // Rough estimate: 1 token ≈ 4 chars

    if (estimatedTokens > 8000) {
        console.warn("⚠️  Warning: Prompt is very large (>8000 tokens). May exceed model context window.");
    }

    return [
        {
            role: "user",
            content: userPrompt
        }
    ];
}
