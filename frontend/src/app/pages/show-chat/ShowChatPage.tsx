import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip,
    IconButton
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetChatQuery } from "../../services/Chat.api.ts";
import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../../../constants.ts";
import Conversation from "../../components/conversation/Conversation.tsx";
import type { ChatMessage } from "../../types/Conversation.ts";
import { useMemo } from "react";

const ShowChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const chatId = id ? parseInt(id, 10) : undefined;
    const { data, isLoading, error } = useGetChatQuery(chatId!, { skip: !chatId || isNaN(chatId) });
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(APP_ROUTES.CHAT_LIST);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Convert Django chat messages to simple format for Conversation component
    const messages: ChatMessage[] = useMemo(() => {
        if (!data?.chat?.messages) return [];
        return data.chat.messages as ChatMessage[];
    }, [data]);

    // Get avatar IDs
    const leftAvatarId = "user-avatar"; // User avatar
    const rightAvatarId = data?.chat?.avatar_id || "assistant-avatar"; // Assistant avatar

    if (!id || !chatId || isNaN(chatId)) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Invalid chat ID
                </Alert>
            </Container>
        );
    }

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
                    Failed to load chat. Please try again later.
                </Alert>
            </Container>
        );
    }

    if (!data?.chat) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Chat not found
                </Alert>
            </Container>
        );
    }

    const chat = data.chat;

    return (
        <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} aria-label="back to chat list">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" component="h1">
                            {chat.title || 'Untitled Chat'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Last updated: {formatDate(chat.updated_at)}
                            </Typography>
                            {chat.completed && (
                                <Chip label="Completed" size="small" color="success" />
                            )}
                        </Box>
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
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {messages.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No messages in this chat yet.
                        </Typography>
                    </Box>
                ) : (
                    <Conversation
                        messages={messages}
                        leftAvatarId={leftAvatarId}
                        rightAvatarId={rightAvatarId}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default ShowChatPage;
