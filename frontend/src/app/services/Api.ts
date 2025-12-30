import {
    type BaseQueryFn,
    type FetchArgs,
    fetchBaseQuery,
    type FetchBaseQueryError,
    type BaseQueryApi,
    retry
} from "@reduxjs/toolkit/query";
import {Mutex} from "async-mutex";
import {createApi} from "@reduxjs/toolkit/query/react";
import {getApiToken, getRefreshToken, setApiToken, setRefreshToken} from "../store/preferences.slice.ts";


export interface BaseResponse<T> {
    status: number;
    message: string;
    data: T;
}

const baseQuery = fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL || window.location.origin) + "/api",
    prepareHeaders: (headers, {getState}) => {
        const token = getApiToken(getState());
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    }
});

const baseQueryWithRetry = retry(baseQuery, {maxRetries: 0});
const baseQueryWithNoRetry = retry(baseQuery, {maxRetries: 0});
const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: object
) => {
    await mutex.waitForUnlock();
    let redirectOnLogout = false;
    let result = await baseQueryWithRetry(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshToken = getRefreshToken(api.getState());
                const refreshResult = await baseQueryWithNoRetry({
                    url: '/token/refresh/',
                    method: 'POST',
                    body: {refresh: refreshToken}
                }, api, extraOptions);

                const resultData = refreshResult.data as { access: string };

                if (resultData && resultData.access) {
                    api.dispatch(setApiToken(resultData.access))
                    result = await baseQueryWithRetry(args, api, extraOptions);
                } else {
                    api.dispatch(setApiToken());
                    api.dispatch(setRefreshToken());
                    redirectOnLogout = true;
                }
            } finally {
                release();
                if (redirectOnLogout) {
                    void redirectOnLogout; // Placeholder for potential redirect logic
                }
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQueryWithRetry(args, api, extraOptions);
        }
    }
    return result;
}

export const api = createApi({
    reducerPath: 'splitApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Note', 'User', 'Chat'],
    endpoints: (builder) => ({
        getNotes: builder.query({
            query: () => ({
                url: '/notes/',
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetNotesQuery,
} = api;
