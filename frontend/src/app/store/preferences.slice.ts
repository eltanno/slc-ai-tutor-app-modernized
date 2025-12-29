import type {PayloadAction} from "@reduxjs/toolkit";
import {createSlice} from "@reduxjs/toolkit";
import type {RootState} from "./store.ts";
import {getAvatarById} from "../utils/getAvatarById.ts";

export type PreferencesState = {
  userAvatarId: string;
  apiToken?: string;
  refreshToken?: string;
  seenDialogs: { [dialogId: string]: boolean };
  chatSettings?: {
    botAvatarId: string;
    llmModel: string;
  }
};

const initialState = {
  apiToken: undefined,
  refreshToken: undefined,
  userAvatarId: "1",
  seenDialogs: {
    "welcome": false,
  },
  chatSettings: undefined,
} as PreferencesState;

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setUserAvatarId(state, action: PayloadAction<string>) {
      state.userAvatarId = action.payload;
    },
    setSeenDialog(state, action: PayloadAction<{ dialogId: string; seen: boolean }>) {
      const { dialogId, seen } = action.payload;
      state.seenDialogs[dialogId] = seen;
    },
    setApiToken(state, action: PayloadAction<string | undefined>) {
      state.apiToken = action.payload;
    },
    setRefreshToken(state, action: PayloadAction<string | undefined>) {
      state.refreshToken = action.payload;
    },
    setChatSettings(state, action: PayloadAction<PreferencesState['chatSettings']>) {
      state.chatSettings = action.payload;
    },
    resetState(state){
      state.apiToken = initialState.apiToken;
      state.refreshToken = initialState.refreshToken;
      state.userAvatarId = initialState.userAvatarId;
      state.seenDialogs = initialState.seenDialogs;
      state.chatSettings = initialState.chatSettings;
    }
  },
});

export const getUserAvatarId = (state: RootState) => state.preferences.userAvatarId; // Selector
export const getUserAvatar = (state: RootState) => getAvatarById(state.preferences.userAvatarId); // Selector

export const getSeenDialogs = (state: RootState) => state.preferences.seenDialogs; // Selector

export const getApiToken = (state: RootState) => state.preferences.apiToken; // Selector
export const getRefreshToken = (state: RootState) => state.preferences.refreshToken; // Selector

export const getChatSettings = (state: RootState) => state.preferences.chatSettings;

export const {
  resetState,
  setUserAvatarId,
  setSeenDialog,
  setApiToken,
  setRefreshToken,
  setChatSettings,
} = preferencesSlice.actions; // Auto-generated action

export default preferencesSlice.reducer;
