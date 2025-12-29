export interface OpenWebUIMessage {
    id: string;
    parentId: string | null;
    childrenIds: string[];
    role: string;
    content: string;
    timestamp: number;
    model?: string;
    modelName?: string;
    modelIdx?: number;
    userContext?: null;
    done?: boolean;
    models?: string[];
}

export interface OpenWebUIMessageFormat {
    messages: Record<string, OpenWebUIMessage>;
    currentId: string | null;
    messageArray: OpenWebUIMessage[];
}

/**
 * Converts simple {role, content} messages to OpenWebUI's complex format
 * with linked list structure, IDs, and metadata
 */
export const convertMessagesToOpenWebUIFormat = (
    messages: { role: string; content: string }[],
    modelName: string
): OpenWebUIMessageFormat => {
    const historyMessages: Record<string, OpenWebUIMessage> = {};
    const messageArray: OpenWebUIMessage[] = [];
    let previousId: string | null = null;
    const baseTimestamp = Date.now();

    messages.forEach((msg, index) => {
        const messageId = `msg-${baseTimestamp}-${index}`;
        const timestamp = Math.floor(baseTimestamp / 1000);
        const nextIndex = index + 1;
        const nextId = nextIndex < messages.length ? `msg-${baseTimestamp}-${nextIndex}` : null;

        const openWebUIMessage: OpenWebUIMessage = {
            id: messageId,
            parentId: previousId,
            childrenIds: nextId ? [nextId] : [],
            role: msg.role,
            content: msg.content,
            timestamp: timestamp,
            ...(msg.role === 'assistant' ? {
                model: modelName,
                modelName: modelName,
                modelIdx: 0,
                userContext: null,
                done: true
            } : {
                models: [modelName]
            })
        };

        historyMessages[messageId] = openWebUIMessage;
        messageArray.push(openWebUIMessage);
        previousId = messageId;
    });

    return {
        messages: historyMessages,
        currentId: previousId,
        messageArray
    };
};

/**
 * Converts OpenWebUI's complex message format back to simple {role, content} format
 * for use with our Conversation component
 */
export const convertOpenWebUIMessagesToSimple = (
    openWebUIMessages: OpenWebUIMessage[]
): { role: string; content: string }[] => {
    return openWebUIMessages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
};
