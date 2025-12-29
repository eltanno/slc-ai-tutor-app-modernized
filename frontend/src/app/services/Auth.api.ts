import {api} from "./Api.ts";
import type { UserData } from "../types/User";

export interface PaginatedResponse<T> {
  status: string;
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
    next_page: number | null;
    prev_page: number | null;
  };
  items: T[];
}

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => {
                return {
                    url: '/token/',
                    method: 'POST',
                    body: credentials,
                }
            }
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                url: '/register/',
                method: 'POST',
                body: userInfo,
            }),
        }),
        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: '/token/refresh/',
                method: 'POST',
                body: { refresh: refreshToken },
            }),
            extraOptions: {
                maxRetries: 1,
            }
        }),
        getLoggedInUser: builder.query({
            query: () => ({
                url: '/user/me/',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        getAllUsers: builder.query<PaginatedResponse<UserData>, { page?: number; page_size?: number }>({
            query: ({ page = 1, page_size = 100 } = {}) => ({
                url: '/users/',
                params: { page, page_size },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({ type: 'User' as const, id })),
                          { type: 'User', id: 'LIST' },
                      ]
                    : [{ type: 'User', id: 'LIST' }],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useGetLoggedInUserQuery,
    useGetAllUsersQuery,
} = authApi;
