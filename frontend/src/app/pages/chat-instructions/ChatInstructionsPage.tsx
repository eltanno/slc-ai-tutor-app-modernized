import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../../../constants.ts";
import AvatarImg from "../../components/avatar-img/AvatarImg.tsx";
import { YouTubeEmbed } from "../../components/youtube-embed";
import { useCreateChatMutation } from "../../services/Chat.api.ts";
import { getChatMetadataById } from "../../utils/getChatMetadataById.ts";
import usePreferences from "../../utils/usePreferences.ts";
import { logger } from "../../utils/logger";

const ChatInstructionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatData = useMemo(() => getChatMetadataById(id), [id]);
    const { userAvatarId } = usePreferences();
    const [createChat] = useCreateChatMutation();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartChat = async () => {
        if (!id || !chatData) {
            setError("Invalid chat configuration");
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Build system message from resident data
            let systemMessage = "";
            if (chatData.resident) {
                if (chatData.resident.name) systemMessage += `Name: ${chatData.resident.name} \n`;
                if (chatData.resident.preferred_name) systemMessage += `Preferred Name: ${chatData.resident.preferred_name} \n`;
                if (chatData.resident.initial_state) systemMessage += `Setting: ${chatData.resident.initial_state} \n`;
                if (chatData.resident.goals) systemMessage += `Goals: ${chatData.resident.goals} \n`;
                if (chatData.resident.must_disclose) systemMessage += `Must Disclose: ${chatData.resident.must_disclose} \n`;
                if (chatData.resident.refusals) systemMessage += `Refusals: ${chatData.resident.refusals} \n`;
            }

            // Create the Django chat with initial system message
            const response = await createChat({
                title: chatData.unit || "New Chat",
                course_data: chatData,
                avatar_id: userAvatarId || chatData.avatar_id,
                messages: [{ role: "system", content: systemMessage }],
            }).unwrap();

            // Navigate to the chat page with the Django chat ID
            navigate(APP_ROUTES.CHAT.replace(':id', response.chat.id.toString()));
        } catch (err) {
            logger.error("Failed to create chat:", err);
            const error = err as { data?: { message?: string }; message?: string };
            setError(error?.data?.message || error?.message || "Failed to create chat. Please try again.");
            setIsCreating(false);
        }
    };

    if (!chatData) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Chat not found. Please select a valid chat from the dashboard.
                </Alert>
            </Container>
        );
    }

    const { unit, description_html, youtube_video_id, resident, avatar_id } = chatData;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    {avatar_id && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <AvatarImg avatarId={avatar_id} size={120} direction="right" />
                        </Box>
                    )}
                    <Typography variant="h3" component="h1" gutterBottom color="primary">
                        {unit}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                </Box>

                {/* Resident Information */}
                {resident && (
                    <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50', mb: 4 }}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h5" component="h2">
                                    Resident Information
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Name:
                                </Typography>
                                <Typography variant="body1" sx={{ ml: 2 }}>
                                    {resident.name}
                                    {resident.preferred_name && (
                                        <Chip
                                            label={`Prefers: ${resident.preferred_name}`}
                                            size="small"
                                            color="primary"
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Description with HTML content */}
                {description_html && (
                    <Box sx={{ mb: 4 }}>
                        <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
                            <Box
                                dangerouslySetInnerHTML={{ __html: description_html }}
                                sx={{
                                    '& p': { mb: 2, lineHeight: 1.6 },
                                    '& ul': { pl: 3, mb: 2 },
                                    '& li': { mb: 1 },
                                    '& strong': { fontWeight: 600 }
                                }}
                            />
                        </Paper>
                    </Box>
                )}

                {/* YouTube Video */}
                {youtube_video_id && (
                    <Box sx={{ mb: 4 }}>
                        <YouTubeEmbed videoId={youtube_video_id} />
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Start Chat Button */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                        onClick={handleStartChat}
                        disabled={isCreating}
                        sx={{
                            minWidth: 200,
                            py: 1.5,
                            fontSize: '1.1rem'
                        }}
                    >
                        {isCreating ? "Creating Chat..." : "Start Chat"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ChatInstructionsPage;
