
export interface ChatMessage {
    role: string;
    content: string;
}

export interface TokenUsageDetails {
    cached_tokens?: number;
    audio_tokens?: number;
}

export interface TokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: TokenUsageDetails;
    completion_tokens_details?: TokenUsageDetails;
}

export interface ChatHistoryMessage {
    id: string;
    parentId: string | null;
    childrenIds: string[];
    role: string;
    content: string;
    timestamp: number;
    model?: string;
    modelName?: string;
    modelIdx?: number;
    userContext?: string | null;
    lastSentence?: string;
    usage?: TokenUsage;
    done?: boolean;
}

export interface ChatFile {
    id: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
}

export interface Chat {
    id: string;
    title: string;
    chat: {
        id: string;
        title: string;
        models: string[];
        params: Record<string, string | number | boolean>;
        history: {
            messages: Record<string, ChatHistoryMessage>;
            currentId: string | null;
        };
        messages: ChatMessage[];
        tags: string[];
        timestamp: number;
        files: ChatFile[];
        model: string;
    };
    updated_at: number;
    created_at: number;
    share_id: string | null;
    archived: boolean;
    pinned: boolean;
    meta: {
        tags: string[];
    };
    folder_id: string | null;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    chat: Chat;
    updated_at: number;
    created_at: number;
    share_id: string | null;
    archived: boolean;
    pinned: boolean;
    meta: {
        tags: string[];
    };
    folder_id: string | null;
}
