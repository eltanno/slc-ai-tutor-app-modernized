import {useDispatch, useSelector} from "react-redux";
import type { PreferencesState } from "../store/preferences.slice.ts";
import {
    getApiToken, getChatSettings,
    getRefreshToken,
    getSeenDialogs,
    getUserAvatar,
    getUserAvatarId,
    resetState as resetStateX,
    setApiToken as setApiTokenX,
    setRefreshToken as setRefreshTokenX,
    setSeenDialog as setSeenDialogX,
    setUserAvatarId as setUserAvatarIdX,
    setChatSettings as setChatSettingsX
} from "../store/preferences.slice.ts";

const usePreferences = () => {
    const dispatch = useDispatch();

    //USER AVATAR
    const userAvatarId = useSelector(getUserAvatarId);

    const userAvatar = useSelector(getUserAvatar);

    const setUserAvatarId = (id:string) => {
        dispatch(setUserAvatarIdX(id));
    };

    //API TOKENS
    const apiToken = useSelector(getApiToken);
    const setApiToken = (token?:string) => {
        dispatch(setApiTokenX(token));
    }
    const refreshToken = useSelector(getRefreshToken);
    const setRefreshToken = (token?:string) => {
        dispatch(setRefreshTokenX(token));
    }

    const seenDialogs = useSelector(getSeenDialogs);
    const hasSeenDialog = (key:string) => {
        return !!seenDialogs[key];
    }
    const setSeenDialog = (key:string, seen:boolean) => {
        dispatch(setSeenDialogX({dialogId: key, seen: seen}));
    }

    const chatSettings = useSelector(getChatSettings);
    const setChatSettings = (settings: PreferencesState['chatSettings']) => {
        dispatch(setChatSettingsX(settings));
    }

    const resetState = () => {
        dispatch(resetStateX());
    }

    return {
        userAvatarId,
        userAvatar,
        setUserAvatarId,
        apiToken,
        setApiToken,
        refreshToken,
        setRefreshToken,
        hasSeenDialog,
        setSeenDialog,
        resetState,
        chatSettings,
        setChatSettings
    };
}

export default usePreferences;
