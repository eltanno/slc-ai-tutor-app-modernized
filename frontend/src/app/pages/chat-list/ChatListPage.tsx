import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    Tabs,
    Tab,
    Grid
} from "@mui/material";
import { useGetChatsQuery, useDeleteChatMutation } from "../../services/Chat.api.ts";
import { useGetLoggedInUserQuery } from "../../services/Auth.api.ts";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants.ts";
import { useState } from "react";
import UserList from "../../components/user-list/UserList.tsx";
import UserChatsList from "../../components/user-chats-list/UserChatsList.tsx";
import type { UserData } from "../../types/User.ts";
import AsyncDataWrapper from "../../components/async-data-wrapper";
import EmptyState from "../../components/empty-state";
import ChatListItem from "../../components/chat-list-item";

const ChatListPage = () => {
    const { data, isLoading, error } = useGetChatsQuery({ page: 1, page_size: 100 });
    const { data: currentUserData } = useGetLoggedInUserQuery({});
    const [deleteChat] = useDeleteChatMutation();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const navigate = useNavigate();

    const currentUser = currentUserData?.user;
    const isStaff = currentUser?.is_staff || false;

    const handleChatClick = (chatId: number) => {
        navigate(APP_ROUTES.CHAT.replace(':id', chatId.toString()));
    };

    const handleDelete = async (event: React.MouseEvent, chatId: number) => {
        event.stopPropagation(); // Prevent triggering the ListItemButton click

        if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            setDeletingId(chatId);
            try {
                await deleteChat(chatId).unwrap();
            } catch (error) {
                console.error('Failed to delete chat:', error);
                alert('Failed to delete chat. Please try again.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setSelectedUser(null); // Reset selected user when changing tabs
    };

    const handleUserClick = (user: UserData) => {
        setSelectedUser(user);
    };

    const chatList = data?.items || [];

    return (
        <AsyncDataWrapper
            isLoading={isLoading}
            error={error}
            errorMessage="Failed to load chats. Please try again later."
            useContainer
            containerMaxWidth="lg"
        >
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Chats
                    </Typography>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={currentTab} onChange={handleTabChange}>
                            <Tab label="My Chats" />
                            {isStaff && <Tab label="All Users" />}
                        </Tabs>
                    </Box>

                    {currentTab === 0 && (
                        <Box>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {data?.pagination.total_items || 0} {data?.pagination.total_items === 1 ? 'chat' : 'chats'} found
                            </Typography>

                            {chatList.length === 0 ? (
                                <EmptyState message="No chats yet. Start a new conversation to get started!" />
                            ) : (
                                <List>
                                    {chatList.map((chat) => (
                                        <ChatListItem
                                            key={chat.id}
                                            id={chat.id}
                                            title={chat.title}
                                            completed={chat.completed}
                                            updatedAt={chat.updated_at}
                                            interactionCount={chat.interaction_count}
                                            score={chat.score}
                                            avatarId={chat.avatar_id}
                                            onClick={handleChatClick}
                                            onDelete={handleDelete}
                                            isDeleting={deletingId === chat.id}
                                        />
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}

                    {currentTab === 1 && isStaff && (
                        <Grid container spacing={1}>
                            <Grid size={5}>
                                <UserList
                                    onUserClick={handleUserClick}
                                    selectedUserId={selectedUser?.id}
                                />
                            </Grid>
                            <Grid size={7}>
                                {selectedUser ? (
                                    <UserChatsList user={selectedUser} />
                                ) : (
                                    <EmptyState message="Select a user to view their chats" />
                                )}
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </Container>
        </AsyncDataWrapper>
    );
};

export default ChatListPage;
