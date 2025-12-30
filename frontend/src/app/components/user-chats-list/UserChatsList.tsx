import { List, Box, Typography } from "@mui/material";
import { useGetUserChatsQuery } from "../../services/Chat.api";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants";
import type { UserData } from "../../types/User";
import AsyncDataWrapper from "../async-data-wrapper";
import ChatListItem from "../chat-list-item";

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

    const chatList = data?.items || [];

    return (
        <AsyncDataWrapper
            isLoading={isLoading}
            error={error}
            errorMessage="Failed to load chats for this user. Please try again later."
            isEmpty={chatList.length === 0}
            emptyMessage="This user has no chats yet."
        >
            <Box>
                <Typography variant="h6" gutterBottom>
                    Chats for {user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {data?.pagination.total_items || 0} {data?.pagination.total_items === 1 ? 'chat' : 'chats'} found
                </Typography>

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
                        />
                    ))}
                </List>
            </Box>
        </AsyncDataWrapper>
    );
};

export default UserChatsList;
