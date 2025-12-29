import {Routes, Route, Navigate} from "react-router-dom";
import NotFound from "./pages/not-found/NotFound";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/homepage/HomePage.tsx";
import DashboardPage from "./pages/dashboard/DashboardPage.tsx";
import ForceLogin from "./components/force-login/ForceLogin.tsx";
import type {ReactNode} from "react";
import MainLayout from "./layout/MainLayout.tsx";
import ChatPage from "./pages/chat/ChatPage.tsx";
import ChatInstructionsPage from "./pages/chat-instructions/ChatInstructionsPage.tsx";
import AvatarSelectPage from "./pages/avatar-select/AvatarSelectPage.tsx";
import usePreferences from "./utils/usePreferences.ts";
import {useEffect} from "react";
import TestPage from "./pages/test-page/TestPage.tsx";
import ChatListPage from "./pages/chat-list/ChatListPage.tsx";
import ShowChatPage from "./pages/show-chat/ShowChatPage.tsx";
import { APP_ROUTES } from "../constants.ts";
import LayoutTest from "./pages/chat/LayoutTest.tsx";

const Logout = () => {
    const {resetState} = usePreferences();

    useEffect(() => {
        resetState();
    }, [resetState]);
    localStorage.clear();

    return <Navigate to={APP_ROUTES.LOGIN} />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path={APP_ROUTES.LAYOUT_TEST} element={<LayoutTest /> as ReactNode} />
            <Route path={APP_ROUTES.HOMEPAGE} element={<HomePage /> as ReactNode} />
            <Route path={APP_ROUTES.TEST} element={<TestPage /> as ReactNode} />
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage /> as ReactNode} />
            <Route path={APP_ROUTES.LOGOUT} element={<Logout /> as ReactNode} />
            <Route path={'/'} element={<MainLayout />  as ReactNode} >
                <Route path={APP_ROUTES.DASHBOARD} element={<ForceLogin><DashboardPage /></ForceLogin> as ReactNode} />
                <Route path={APP_ROUTES.AVATAR_SELECT} element={<ForceLogin><AvatarSelectPage /></ForceLogin> as ReactNode} />
                <Route path={APP_ROUTES.CHAT_INSTRUCTIONS} element={<ForceLogin><ChatInstructionsPage /></ForceLogin> as ReactNode} />
                <Route path={APP_ROUTES.CHAT} element={<ForceLogin><ChatPage /></ForceLogin> as ReactNode} />
                <Route path={APP_ROUTES.CHAT_LIST} element={<ForceLogin><ChatListPage /></ForceLogin> as ReactNode} />
                <Route path={APP_ROUTES.SHOW_CHAT} element={<ForceLogin><ShowChatPage /></ForceLogin> as ReactNode} />
            </Route>
            <Route path="*" element={<NotFound /> as ReactNode} />
        </Routes>
    );
}

export default AppRoutes;
