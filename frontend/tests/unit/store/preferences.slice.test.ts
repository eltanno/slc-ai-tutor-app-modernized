import { describe, it, expect } from 'vitest';
import preferencesReducer, {
  setUserAvatarId,
  setApiToken,
  setRefreshToken,
  setSeenDialog,
  setChatSettings,
  resetState,
  getUserAvatarId,
  getUserAvatar,
  getApiToken,
  getRefreshToken,
  getChatSettings,
  getSeenDialogs,
  type PreferencesState,
} from '../../../src/app/store/preferences.slice';

// Helper to create initial state
const createInitialState = (): PreferencesState => ({
  userAvatarId: '1',
  apiToken: undefined,
  refreshToken: undefined,
  seenDialogs: { welcome: false },
  chatSettings: undefined,
});

// Helper to create mock RootState for selector tests
const createMockRootState = (preferences: PreferencesState) => ({
  preferences,
  // Add minimal mock for other slices if needed
  api: {},
  llmApi: {},
});

describe('preferences slice reducers', () => {
  it('setUserAvatarId should update userAvatarId', () => {
    const initialState = createInitialState();
    const newState = preferencesReducer(initialState, setUserAvatarId('5'));

    expect(newState.userAvatarId).toBe('5');
  });

  it('setApiToken should store token', () => {
    const initialState = createInitialState();
    const newState = preferencesReducer(initialState, setApiToken('test-token-123'));

    expect(newState.apiToken).toBe('test-token-123');
  });

  it('setRefreshToken should store refresh token', () => {
    const initialState = createInitialState();
    const newState = preferencesReducer(initialState, setRefreshToken('refresh-token-456'));

    expect(newState.refreshToken).toBe('refresh-token-456');
  });

  it('setSeenDialog should mark dialog as seen', () => {
    const initialState = createInitialState();
    const newState = preferencesReducer(
      initialState,
      setSeenDialog({ dialogId: 'welcome', seen: true })
    );

    expect(newState.seenDialogs.welcome).toBe(true);
  });

  it('setSeenDialog should handle new dialog ids', () => {
    const initialState = createInitialState();
    const newState = preferencesReducer(
      initialState,
      setSeenDialog({ dialogId: 'tutorial', seen: true })
    );

    expect(newState.seenDialogs.tutorial).toBe(true);
    expect(newState.seenDialogs.welcome).toBe(false); // Original unchanged
  });

  it('setChatSettings should store chat settings', () => {
    const initialState = createInitialState();
    const chatSettings = { botAvatarId: '10', llmModel: 'gpt-4' };
    const newState = preferencesReducer(initialState, setChatSettings(chatSettings));

    expect(newState.chatSettings).toEqual(chatSettings);
    expect(newState.chatSettings?.botAvatarId).toBe('10');
    expect(newState.chatSettings?.llmModel).toBe('gpt-4');
  });

  it('resetState should restore initial state', () => {
    // Start with modified state
    const modifiedState: PreferencesState = {
      userAvatarId: '15',
      apiToken: 'some-token',
      refreshToken: 'some-refresh-token',
      seenDialogs: { welcome: true, tutorial: true },
      chatSettings: { botAvatarId: '5', llmModel: 'claude' },
    };

    const newState = preferencesReducer(modifiedState, resetState());

    expect(newState.userAvatarId).toBe('1');
    expect(newState.apiToken).toBeUndefined();
    expect(newState.refreshToken).toBeUndefined();
    expect(newState.seenDialogs).toEqual({ welcome: false });
    expect(newState.chatSettings).toBeUndefined();
  });
});

describe('preferences slice selectors', () => {
  it('getUserAvatarId should return avatar id', () => {
    const state = createMockRootState({
      ...createInitialState(),
      userAvatarId: '7',
    });


    expect(getUserAvatarId(state as any)).toBe('7');
  });

  it('getUserAvatar should return avatar object', () => {
    const state = createMockRootState({
      ...createInitialState(),
      userAvatarId: '1',
    });


    const avatar = getUserAvatar(state as any);

    expect(avatar).toBeDefined();
    expect(avatar?.id).toBe('1');
    expect(avatar?.label).toBe('Carer 1');
  });

  it('getApiToken should return token', () => {
    const state = createMockRootState({
      ...createInitialState(),
      apiToken: 'my-api-token',
    });


    expect(getApiToken(state as any)).toBe('my-api-token');
  });

  it('getRefreshToken should return refresh token', () => {
    const state = createMockRootState({
      ...createInitialState(),
      refreshToken: 'my-refresh-token',
    });


    expect(getRefreshToken(state as any)).toBe('my-refresh-token');
  });

  it('getSeenDialogs should return dialogs object', () => {
    const state = createMockRootState({
      ...createInitialState(),
      seenDialogs: { welcome: true, intro: false },
    });


    const dialogs = getSeenDialogs(state as any);

    expect(dialogs.welcome).toBe(true);
    expect(dialogs.intro).toBe(false);
  });

  it('getChatSettings should return chat settings', () => {
    const chatSettings = { botAvatarId: '12', llmModel: 'llama' };
    const state = createMockRootState({
      ...createInitialState(),
      chatSettings,
    });


    expect(getChatSettings(state as any)).toEqual(chatSettings);
  });
});
