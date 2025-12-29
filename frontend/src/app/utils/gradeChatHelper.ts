/**
 * Helper function to grade a chat programmatically
 */

import type { ChatMessage } from "../services/Chat.api";
import type { ChatMetadata } from "./formatGradingRequest";
import type { ChatGradingResponse } from "../types/Grading";
import { prepareGradingMessages } from "./formatGradingRequest";

/**
 * Standalone function to grade a chat (no UI component)
 * Useful for programmatic grading
 */
export async function gradeChat(
    chatMetadata: ChatMetadata,
    messages: ChatMessage[],
    sendChatFn: (args: { model: string; messages: Array<{ role: string; content: string }> }) => Promise<{ data?: { choices: Array<{ message: { content: string } }> } }>
): Promise<ChatGradingResponse> {
    const gradingMessages = prepareGradingMessages(chatMetadata, messages);

    const response = await sendChatFn({
        model: "slc-tutor-evaluator",
        messages: gradingMessages,
    });

    if (!response.data) {
        throw new Error("Failed to get grading response");
    }

    const content = response.data.choices[0].message.content;
    return JSON.parse(content) as ChatGradingResponse;
}
