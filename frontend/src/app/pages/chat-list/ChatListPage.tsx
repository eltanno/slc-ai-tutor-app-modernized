import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Grid
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetChatsQuery, useDeleteChatMutation } from "../../services/Chat.api.ts";
import { useGetLoggedInUserQuery } from "../../services/Auth.api.ts";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants.ts";
import { useState } from "react";
import UserList from "../../components/user-list/UserList.tsx";
import UserChatsList from "../../components/user-chats-list/UserChatsList.tsx";
import type { UserData } from "../../types/User.ts";

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setSelectedUser(null); // Reset selected user when changing tabs
    };

    const handleUserClick = (user: UserData) => {
        setSelectedUser(user);
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Failed to load chats. Please try again later.
                </Alert>
            </Container>
        );
    }

    const chatList = data?.items || [];

    return (
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
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    No chats yet. Start a new conversation to get started!
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {chatList.map((chat) => (
                                    <ListItem
                                        key={chat.id}
                                        disablePadding
                                        sx={{
                                            mb: 1,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={(e) => handleDelete(e, chat.id)}
                                                disabled={deletingId === chat.id}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemButton onClick={() => handleChatClick(chat.id)}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h6" component="span">
                                                            {chat.title || 'Untitled Chat'}
                                                        </Typography>
                                                        {chat.completed && (
                                                            <Chip label="Completed" size="small" color="success" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Last updated: {formatDate(chat.updated_at)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {chat.interaction_count} {chat.interaction_count === 1 ? 'message' : 'messages'}
                                                            {chat.score !== null && ` • Score: ${chat.score.toFixed(1)}`}
                                                        </Typography>
                                                        {chat.avatar_id && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Avatar: {chat.avatar_id}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
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
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Select a user to view their chats
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default ChatListPage;
