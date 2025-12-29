
export interface ChatMessage {
    role: string;
    content: string;
}

export interface Chat {
    id: string;
    title: string;
    chat: {
        id: string;
        title: string;
        models: string[];
        params: Record<string, any>;
        history: {
            messages: Record<string, {
                id: string;
                parentId: string | null;
                childrenIds: string[];
                role: string;
                content: string;
                timestamp: number;
                model?: string;
                modelName?: string;
                modelIdx?: number;
                userContext?: any;
                lastSentence?: string;
                usage?: {
                    prompt_tokens: number;
                    completion_tokens: number;
                    total_tokens: number;
                    prompt_tokens_details?: any;
                    completion_tokens_details?: any;
                };
                done?: boolean;
            }>;
            currentId: string | null;
        };
        messages: ChatMessage[];
        tags: string[];
        timestamp: number;
        files: any[];
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
