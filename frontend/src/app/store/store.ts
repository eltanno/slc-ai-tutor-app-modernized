import type {ConfigureStoreOptions} from "@reduxjs/toolkit";
import {configureStore} from "@reduxjs/toolkit";
import {api} from "../services/Api.ts";
import {type TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {llmApi} from "../services/OpenWebUiApi.ts";
import {loadState, saveState} from "./localStorage.ts";
import preferencesReducer from "./preferences.slice.ts";

const preloadedState = loadState();

const createStore = (options?: ConfigureStoreOptions) =>
    configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
            [llmApi.reducerPath]: llmApi.reducer,
            preferences: preferencesReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
            .concat(api.middleware)
            .concat(llmApi.middleware),
        preloadedState,
        ...options
    })

const store = createStore();

store.subscribe(() => {
    saveState({
        preferences:store.getState().preferences,
    });
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const getState = () => store.getState();

export default store;
