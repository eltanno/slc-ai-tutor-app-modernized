import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { Chat } from "../types/Conversation.ts";

// https://github.com/open-webui/open-webui/discussions/16402
// Check swagger: http://localhost:8080/swagger/index.html
// NOTE: This API is no longer used - all LLM operations go through Django backend

const baseUrl = window.location.protocol+"//"+window.location.hostname + ":8080/api";

const baseQuery = fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
        // No longer using OpenWebUI tokens - all auth handled by Django backend
        return headers;
    }
});

export const llmApi = createApi({
    reducerPath: 'llmApi',
    baseQuery: baseQuery,
    tagTypes: ['Chat'],
    endpoints: (builder) => ({
        sendChat: builder.mutation({
            query: (body: {messages: {"role": string, "content": string}[], model: string}) => ({
                url: '/chat/completions',
                method: 'POST',
                body,
            }),
        }),
        signIn: builder.mutation({
            query: (body: {email: string, password: string}) => ({
                url: '/v1/auths/signin',
                method: 'POST',
                body,
            }),
        }),
        getModels: builder.query({
            query: () => ({
                url: '/models',
                method: 'GET',
            }),
        }),
        getChats: builder.query({
            query: () => ({
                url: '/v1/chats/list',
                method: 'GET',
            }),
            providesTags: ['Chat'],
        }),
        getChat: builder.query({
            query: (chatId: string) => ({
                url: `/v1/chats/${chatId}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, chatId) => [{ type: 'Chat', id: chatId }],
        }),
        createChat: builder.mutation({
            query: (body: Partial<Chat>) => ({
                url: '/v1/chats/new',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),
        updateChat: builder.mutation({
            query: ({ chatId, ...body }: { chatId: string } & Partial<Chat>) => ({
                url: `/v1/chats/${chatId}`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Chat', id: chatId }, 'Chat'],
        }),
        deleteChat: builder.mutation({
            query: (chatId: string) => ({
                url: `/v1/chats/${chatId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Chat'],
        }),
    }),
});

export const {
    useGetModelsQuery,
    useSendChatMutation,
    useGetChatsQuery,
    useGetChatQuery,
    useCreateChatMutation,
    useUpdateChatMutation,
    useDeleteChatMutation,
    useSignInMutation,
} = llmApi;
