import { api } from "./Api";
import type { ChatGradingResponse } from "../types/Grading";
import type { PaginatedResponse } from "../types/Api";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'scenario';
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  title: string;
  course_data: unknown;  // JSON data for the course
  avatar_id: string | null;
  messages: ChatMessage[];
  score: number | null;
  grading_data: ChatGradingResponse | { error: string; status: string } | null;
  help_responses: Array<{
    turn: number;
    timestamp: string;
    help_text: string;
    status?: 'processing' | 'completed' | 'error';
  }>;
  interaction_count: number;
  completed: boolean;
  status: 'ready' | 'in_progress' | 'thinking' | 'getting_help' | 'ready_for_grading' | 'grading' | 'complete';
  created_at: string;
  updated_at: string;
  openwebui_chat_id: string | null;
}

export interface ChatCreateRequest {
  title: string;
  course_data?: unknown;
  avatar_id?: string;
  messages?: ChatMessage[];
  openwebui_chat_id?: string;
}

export interface ChatUpdateRequest {
  title?: string;
  course_data?: unknown;
  avatar_id?: string;
  messages?: ChatMessage[];
  score?: number;
  interaction_count?: number;
  completed?: boolean;
  openwebui_chat_id?: string;
}

const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List all chats
    getChats: builder.query<PaginatedResponse<Chat>, { page?: number; page_size?: number }>({
      query: ({ page = 1, page_size = 20 } = {}) => ({
        url: `/chats/`,
        params: { page, page_size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Chat' as const, id })),
              { type: 'Chat', id: 'LIST' },
            ]
          : [{ type: 'Chat', id: 'LIST' }],
    }),

    // Get a single chat
    getChat: builder.query<{ status: string; chat: Chat }, number>({
      query: (id) => `/chats/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Chat', id }],
    }),

    // Create a new chat
    createChat: builder.mutation<{ status: string; message: string; chat: Chat }, ChatCreateRequest>({
      query: (chatData) => ({
        url: `/chats/`,
        method: 'POST',
        body: chatData,
      }),
      invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
    }),

    // Update a chat (full update)
    updateChat: builder.mutation<{ status: string; message: string; chat: Chat }, { id: number; data: ChatUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/chats/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Chat', id },
        { type: 'Chat', id: 'LIST' },
      ],
    }),

    // Partial update a chat
    patchChat: builder.mutation<{ status: string; message: string; chat: Chat }, { id: number; data: Partial<ChatUpdateRequest> }>({
      query: ({ id, data }) => ({
        url: `/chats/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Chat', id },
        { type: 'Chat', id: 'LIST' },
      ],
    }),

    // Delete a chat
    deleteChat: builder.mutation<{ status: string; message: string }, number>({
      query: (id) => ({
        url: `/chats/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Chat', id },
        { type: 'Chat', id: 'LIST' },
      ],
    }),

    // Send message and get LLM response
    sendMessage: builder.mutation<
      { status: string; message: string; chat: Chat; response: string },
      { chatId: number; message: string; isAction?: boolean }
    >({
      query: ({ chatId, message, isAction }) => ({
        url: `/chats/${chatId}/send-message/`,
        method: 'POST',
        body: { message, is_action: isAction },
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Chat', id: chatId },
        { type: 'Chat', id: 'LIST' },
      ],
    }),

    // Get conversation help
    getHelp: builder.mutation<
      { status: string; help_text: string; processing?: boolean },
      number
    >({
      query: (chatId) => ({
        url: `/chats/${chatId}/get-help/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, chatId) => [
        { type: 'Chat', id: chatId },
      ],
    }),

    // Grade chat
    gradeChat: builder.mutation<
      { status: string; grading: ChatGradingResponse; message?: string; processing?: boolean },
      number
    >({
      query: (chatId) => ({
        url: `/chats/${chatId}/grade/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, chatId) => [
        { type: 'Chat', id: chatId },
        { type: 'Chat', id: 'LIST' },
      ],
    }),

    // Get chats for a specific user (staff only)
    getUserChats: builder.query<
      PaginatedResponse<Chat> & { user: { id: number; username: string; email: string } },
      { userId: number; page?: number; page_size?: number }
    >({
      query: ({ userId, page = 1, page_size = 100 }) => ({
        url: `/users/${userId}/chats/`,
        params: { page, page_size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Chat' as const, id })),
              { type: 'Chat', id: `USER_${result.user.id}` },
            ]
          : [{ type: 'Chat', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateChatMutation,
  useUpdateChatMutation,
  usePatchChatMutation,
  useDeleteChatMutation,
  useSendMessageMutation,
  useGetHelpMutation,
  useGradeChatMutation,
  useGetUserChatsQuery,
} = chatApi;
