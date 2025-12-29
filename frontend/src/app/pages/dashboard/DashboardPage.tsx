import useLoggedInUser from "../../utils/useLoggedInUser.ts";
import {useMemo} from "react";
import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import TutorDialogModal from "../../components/tutor-dialog-modal/TutorDialogModal.tsx";
import usePreferences from "../../utils/usePreferences.ts";
import AvatarImg from "../../components/avatar-img/AvatarImg.tsx";
import {CHAT_METADATA_LIST} from "../../utils/getChatMetadataById.ts";
import type {ChatMetadata} from "../../utils/getChatMetadataById.ts";
import {Link} from "react-router-dom";

const DashboardPage = () => {
    const {user} = useLoggedInUser();
    const userExists = useMemo(() => !!(user && user.id), [user]);
    const { userAvatar, hasSeenDialog, setSeenDialog } = usePreferences();
    const hasSeenWelcome = hasSeenDialog('welcome');

    // Group conversations by unit
    const conversationsByUnit = useMemo(() => {
        const grouped: Record<string, { unitNumber: number, conversations: ChatMetadata[] }> = {};
        CHAT_METADATA_LIST.forEach((chat) => {
            if (!grouped[chat.unit]) {
                // Extract unit number from the id (e.g., "unit1_conversation1" -> 1)
                const unitNumberMatch = chat.id.match(/unit(\d+)/);
                const unitNumber = unitNumberMatch ? parseInt(unitNumberMatch[1]) : 0;
                grouped[chat.unit] = { unitNumber, conversations: [] };
            }
            grouped[chat.unit].conversations.push(chat);
        });
        return grouped;
    }, []);

    return (
        <Box height="100%" width="100%">
            <>
                {userExists && (
                    <Box mb={4} display="flex" alignItems="center" gap={2}>
                        <AvatarImg avatarId={userAvatar ? userAvatar.id : '1'} size={80} direction={"right"} />
                        <Typography variant="h4">Welcome {user?.username || 'User'}!</Typography>
                    </Box>
                )}
            </>
            <Box mb={4}>
                <Typography variant="h5" mb={3}>Training Scenarios</Typography>
                <Box sx={{ display: 'grid', gap: 3 }}>
                    {Object.entries(conversationsByUnit).map(([unitTitle, { unitNumber, conversations }]) => (
                        <Box key={unitTitle} sx={{ width: '100%' }}>
                            <Card sx={{ overflow: 'hidden' }}>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>
                                        Unit {unitNumber}: {unitTitle}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                                        {conversations.map((chatData) => (
                                            <Box key={chatData.id} sx={{ width: '100%' }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="primary"
                                                    component={Link}
                                                    to={"/chat-instructions/" + chatData.id}
                                                    sx={{
                                                        py: 1.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        justifyContent: 'flex-start',
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    <AvatarImg
                                                        avatarId={chatData.avatar_id}
                                                        size={40}
                                                        direction="right"
                                                    />
                                                    <Typography noWrap>{chatData.resident.name}</Typography>
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Box>
            <TutorDialogModal
                open={!hasSeenWelcome}
                handleClose={() => setSeenDialog('welcome', true)}
                title="Welcome to the site!"
                message="Hi! I'm the SLC Tutor. This is our prototype, and I'll guide you through the first version of the experience.

Please start by choosing your avatar. You can ask me questions or try out the roleplays as you explore. You can also get help from me during the roleplays and feedback at the end."
            />
        </Box>
    );
};

export default DashboardPage;
