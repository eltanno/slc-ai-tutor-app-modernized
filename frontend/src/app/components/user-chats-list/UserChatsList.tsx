import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Chip
} from "@mui/material";
import { useGetUserChatsQuery } from "../../services/Chat.api";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants";
import type { UserData } from "../../types/User";
import { formatDate } from "../../utils/dateUtils";

interface UserChatsListProps {
    user: UserData;
}

const UserChatsList = ({ user }: UserChatsListProps) => {
    const { data, isLoading, error } = useGetUserChatsQuery({
        userId: user.id,
        page: 1,
        page_size: 100
    });
    const navigate = useNavigate();

    const handleChatClick = (chatId: number) => {
        navigate(APP_ROUTES.CHAT.replace(':id', chatId.toString()));
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Failed to load chats for this user. Please try again later.
            </Alert>
        );
    }

    const chatList = data?.items || [];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Chats for {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {data?.pagination.total_items || 0} {data?.pagination.total_items === 1 ? 'chat' : 'chats'} found
            </Typography>

            {chatList.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        This user has no chats yet.
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
    );
};

export default UserChatsList;
