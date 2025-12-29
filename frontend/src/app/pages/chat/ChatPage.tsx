import {Box, Button, Grid, TextField, Typography, Stack, Backdrop, CircularProgress} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import {useSendMessageMutation, useGetChatQuery} from "../../services/Chat.api.ts";
import {useEffect, useState} from "react";
import Conversation from "../../components/conversation/Conversation.tsx";
import usePreferences from "../../utils/usePreferences.ts";
import {useParams} from "react-router-dom";
import TutorDialogModal from "../../components/tutor-dialog-modal/TutorDialogModal.tsx";
import GradeChatButton from "../../components/grade-chat-button/GradeChatButton.tsx";
import GradingResultsModal from "../../components/grading-results-modal/GradingResultsModal.tsx";
import GetHelpButton from "../../components/get-help-button/GetHelpButton.tsx";
import HelpModal from "../../components/help-modal/HelpModal.tsx";
import type { ApiError } from "../../types/Error.ts";
import type { ChatAction, ChatMetadata } from "../../utils/getChatMetadataById.ts";
import type { ChatMessage } from "../../services/Chat.api.ts";
import type { ChatGradingResponse } from "../../types/Grading.ts";

const ChatPage = () => {
    const { id } = useParams();
    const djangoChatId = id ? parseInt(id) : null;
    const { userAvatarId, hasSeenDialog, setSeenDialog } = usePreferences();

    const [sendMessage] = useSendMessageMutation();
    const [errorMessage, setErrorMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usedActionIndices, setUsedActionIndices] = useState<Set<number>>(new Set());
    const [turnCount, setTurnCount] = useState(0);
    const [gradingData, setGradingData] = useState<ChatGradingResponse | null>(null);
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [helpText, setHelpText] = useState<string | null>(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // First, fetch chat data without polling to determine if we need to poll
    const { data: initialChatData } = useGetChatQuery(djangoChatId!, {
        skip: !djangoChatId,
    });

    // Determine if chat is in a loading/processing state
    const chatStatus = initialChatData?.chat?.status;
    const isProcessing = chatStatus === 'thinking' || chatStatus === 'in_progress' || chatStatus === 'grading' || chatStatus === 'getting_help';

    // Poll for updates ONLY when processing
    const { data: chatQueryData } = useGetChatQuery(djangoChatId!, {
        skip: !djangoChatId,
        pollingInterval: isProcessing ? 2000 : 0, // Poll every 2 seconds only when processing
    });

    // Use the polled data if available, otherwise use initial data
    const activeChatData = chatQueryData || initialChatData;

    // Get chat metadata from the loaded chat's course_data
    const chatData = activeChatData?.chat?.course_data as ChatMetadata | undefined;
    const hasSeenWelcome = hasSeenDialog('chat-intro-' + djangoChatId);

    const maxTurns = chatData?.max_turns ?? Infinity;
    const turnsRemaining = maxTurns - turnCount;
    const maxTurnsReached = turnCount >= maxTurns;

    // Update status from active data
    const activeStatus = activeChatData?.chat?.status;
    const isComplete = activeChatData?.chat?.completed || activeStatus === 'complete';
    // Chat is graded if grading_data exists and doesn't have an error property
    const isGraded = !!activeChatData?.chat?.grading_data && !('error' in activeChatData.chat.grading_data);

    // Get loading message based on status
    const getLoadingMessage = () => {
        if (activeStatus === 'thinking') return 'AI is thinking...';
        if (activeStatus === 'in_progress') return 'Processing your message...';
        if (activeStatus === 'getting_help') return <>Getting help from tutor,<br/>This may take a couple of minutes,<br/>please be patient...</>;
        if (activeStatus === 'grading') return <>Grading your conversation,<br />This may take up to 5 minutes,<br />please be patient or check back later...</>;
        return 'Processing...';
    };

    // Update messages and turn count from fetched data
    useEffect(() => {
        if (activeChatData?.chat) {
            const fetchedChat = activeChatData.chat;

            // If chat has messages, use them directly from the backend
            if (fetchedChat.messages && fetchedChat.messages.length > 0) {
                setMessages(fetchedChat.messages);

                // Calculate turn count from user messages
                const userMessageCount = fetchedChat.messages.filter(m => m.role === 'user').length;
                setTurnCount(userMessageCount);

                // Track which actions have been used by checking for scenario messages
                if (chatData?.actions) {
                    const usedIndices = new Set<number>();
                    fetchedChat.messages.forEach(msg => {
                        if (msg.role === 'scenario') {
                            // Find which action this corresponds to
                            const actionIndex = chatData.actions?.findIndex(
                                action => action.prompt === msg.content
                            );
                            if (actionIndex !== undefined && actionIndex !== -1) {
                                usedIndices.add(actionIndex);
                            }
                        }
                    });
                    setUsedActionIndices(usedIndices);
                }
            } else {
                // New chat - initialize with system message from chatData
                let systemMessage = "";
                if (chatData && chatData.resident) {
                    if (chatData.resident.name) systemMessage += `Name: ${chatData.resident.name} \n`;
                    if (chatData.resident.preferred_name) systemMessage += `Preferred Name: ${chatData.resident.preferred_name} \n`;
                    if (chatData.resident.initial_state) systemMessage += `Setting: ${chatData.resident.initial_state} \n`;
                    if (chatData.resident.goals) systemMessage += `Goals: ${chatData.resident.goals} \n`;
                    if (chatData.resident.must_disclose) systemMessage += `Must Disclose: ${chatData.resident.must_disclose} \n`;
                    if (chatData.resident.refusals) systemMessage += `Refusals: ${chatData.resident.refusals} \n`;
                }
                setMessages([{ role: "system" as const, content: systemMessage }]);
                setTurnCount(0);
                setUsedActionIndices(new Set());
            }

            // Update grading data if completed and valid
            if (fetchedChat.grading_data && !gradingData) {
                // Check if it's an error object
                if ('error' in fetchedChat.grading_data) {
                    console.error('Grading failed:', fetchedChat.grading_data.error);
                    setErrorMessage(`Grading failed: ${fetchedChat.grading_data.error}`);
                } else if (fetchedChat.grading_data.communication_quality) {
                    // Valid grading data (has communication_quality means it's valid)
                    setGradingData(fetchedChat.grading_data);
                    setShowGradingModal(true);
                }
            }

            // Check for new help responses (but don't show if graded - grading modal takes priority)
            if (fetchedChat.help_responses && fetchedChat.help_responses.length > 0 && !fetchedChat.grading_data) {
                const latestHelp = fetchedChat.help_responses[fetchedChat.help_responses.length - 1];
                if (latestHelp.status === 'completed' && latestHelp.help_text && !helpText) {
                    setHelpText(latestHelp.help_text);
                    setShowHelpModal(true);
                } else if (latestHelp.status === 'error') {
                    console.error('Help request failed:', latestHelp.help_text);
                    setErrorMessage(`Help request failed: ${latestHelp.help_text}`);
                }
            }
        }
    }, [activeChatData, gradingData, helpText, chatData]);

    const handleSend = async () => {
        if (!input.trim() || maxTurnsReached || !djangoChatId) return;
        setIsSubmitting(true);
        try {
            // Increment turn count
            setTurnCount(prev => prev + 1);

            const userMessageText = input;
            setInput("");

            // Send message through Django API (async)
            const messageResponse = await sendMessage({
                chatId: djangoChatId,
                message: userMessageText,
            });

            if ('data' in messageResponse && messageResponse.data) {
                // Response is 202 ACCEPTED - processing in background
                console.log('Message is being processed asynchronously');
                // Polling will update the UI when complete
            } else if ('error' in messageResponse) {
                const error = messageResponse.error as ApiError;
                setErrorMessage(error.message || "Failed to send message");
            }
        } catch (e) {
            const error = e as ApiError;
            setErrorMessage(error.data?.detail || "An error occurred");
        }
        setIsSubmitting(false);
    };

    const handleActionClick = async (action: ChatAction, actionIndex: number) => {
        // Prevent using the same action twice or if max turns reached
        if (usedActionIndices.has(actionIndex) || maxTurnsReached || !djangoChatId) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Increment turn count
            setTurnCount(prev => prev + 1);

            // Mark this action as used
            setUsedActionIndices(prev => new Set([...prev, actionIndex]));

            // Send action through Django API with is_action flag
            const messageResponse = await sendMessage({
                chatId: djangoChatId,
                message: action.prompt,
                isAction: true,  // Flag to tell backend this is an action/scenario
            });

            if ('data' in messageResponse && messageResponse.data) {
                // Response is 202 ACCEPTED - processing in background
                console.log('Action message is being processed asynchronously');
                // Polling will update the UI when complete
            } else if ('error' in messageResponse) {
                const error = messageResponse.error as ApiError;
                setErrorMessage(error.message || "Failed to send action");
            }
        } catch (e) {
            const error = e as ApiError;
            setErrorMessage(error.data?.detail || "An error occurred");
        }
        setIsSubmitting(false);
    };

    const handleExportChat = () => {
        if (!activeChatData?.chat) return;

        const chat = activeChatData.chat;
        const chatTitle = chat.title || 'Untitled Chat';
        const timestamp = new Date().toLocaleString();
        const residentName = chatData?.resident?.name || 'AI Tutor';

        // Determine score from grading data
        let scoreText = 'Incomplete';
        if (chat.grading_data && !('error' in chat.grading_data)) {
            const gradingData = chat.grading_data as ChatGradingResponse;
            scoreText = gradingData.communication_quality?.overall_score?.toString() || 'N/A';
        }

        // Build transcript
        let transcript = `Chat Transcript: ${chatTitle}\n`;
        transcript += `Exported: ${timestamp}\n`;
        transcript += `Total Messages: ${messages.length}\n`;
        transcript += `Turn Count: ${turnCount}\n`;
        transcript += `Score: ${scoreText}\n`;
        transcript += `\n${'='.repeat(60)}\n\n`;

        // Add messages
        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'Student' :
                        msg.role === 'assistant' ? residentName :
                        msg.role === 'scenario' ? 'Scenario' :
                        msg.role.charAt(0).toUpperCase() + msg.role.slice(1);

            transcript += `[${index + 1}] ${role}:\n`;
            transcript += `${msg.content}\n\n`;
        });

        // Create and download file
        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${djangoChatId}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if(!chatData){
        return <Box p={2}>Chat not found</Box>;
    }

    return (
        <Grid container sx={{
            width: "100%",
            height: `calc(100vh - 105px)`,
            backgroundColor: '#e0e0e0',
            overflow: 'hidden'
            }}>
            <Grid size={10} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box id="chat-area" sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fafafa', p: 2 }}>
                        <Conversation messages={messages} leftAvatarId={userAvatarId} rightAvatarId={chatData.avatar_id} />
                    </Box>
                    <Box component="form" onSubmit={e => { e.preventDefault(); handleSend(); }}
                        display="flex" flexDirection="column" alignItems="stretch" px={2} bgcolor="#fff" boxShadow={1} sx={{ borderTop: '1px solid #eee', minHeight: 72, flexShrink: 0, justifyContent: 'center' }}>
                        <>
                        {errorMessage !== "" && (
                            <Box color="red" mb={1} fontSize={14}>{errorMessage}</Box>
                        )}
                        </>
                        <Box display="flex" alignItems="center" gap={2}>
                            <TextField
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                sx={{ flex: 1 }}
                                disabled={isSubmitting || maxTurnsReached}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!input.trim() || isSubmitting || maxTurnsReached}
                                sx={{ minWidth: 100 }}
                                loading={isSubmitting}
                            >
                                Send
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Grid>
            <Grid size={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box p={2} height="100%" display="flex" flexDirection="column" bgcolor="#f5f5f5" borderLeft="1px solid #e0e0e0" sx={{ overflowY: 'auto' }}>
                    {/* Turn Counter */}
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Turns
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: maxTurnsReached ? '#ffebee' : '#e3f2fd',
                                borderRadius: 1,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h4" component="div" fontWeight="bold">
                                {turnCount} / {maxTurns === Infinity ? '∞' : maxTurns}
                            </Typography>
                            {turnsRemaining <= 3 && turnsRemaining > 0 && (
                                <Typography variant="caption" color="warning.main">
                                    {turnsRemaining} turn{turnsRemaining !== 1 ? 's' : ''} remaining
                                </Typography>
                            )}
                            {maxTurnsReached && (
                                <Typography variant="caption" color="error.main">
                                    Max turns reached
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Typography variant="h6" gutterBottom>
                        Actions
                    </Typography>
                    <Stack spacing={1} sx={{ overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>

                        {/* Scenario-specific actions */}
                        {chatData.actions && chatData.actions.length > 0 ? (
                            chatData.actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleActionClick(action, index)}
                                    disabled={isSubmitting || usedActionIndices.has(index) || maxTurnsReached}
                                    sx={{
                                        textTransform: 'none',
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        opacity: usedActionIndices.has(index) ? 0.5 : 1,
                                    }}
                                >
                                    {action.title}
                                </Button>
                            ))
                        ) : null}
                    </Stack>
                    {/* Complete Chat and Score */}
                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            Complete Chat and Score
                        </Typography>
                        {/* Get Help Button - disabled when completed, graded, grading, or max turns reached */}
                        <GetHelpButton
                            chatId={djangoChatId}
                            onHelpReceived={(help) => {
                                setHelpText(help);
                                setShowHelpModal(true);
                            }}
                            onError={(error) => {
                                setErrorMessage(error);
                            }}
                            disabled={isSubmitting || isComplete || isGraded || maxTurnsReached || chatStatus === 'grading'}
                            fullWidth
                        />
                        {/* Grade Button - disabled only when already graded (max turns is OK) */}
                        <GradeChatButton
                            chatId={djangoChatId}
                            onGradingComplete={(grading) => {
                                setGradingData(grading);
                                setShowGradingModal(true);
                            }}
                            onError={(error) => {
                                setErrorMessage(error);
                            }}
                            disabled={isSubmitting || messages.length <= 1 || isGraded}
                            fullWidth
                        />
                    </Box>

                    {/* Export Chat */}
                    <Box mt={2}>
                        <Typography variant="h6" gutterBottom>
                            Export
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<DownloadIcon />}
                            onClick={handleExportChat}
                            disabled={messages.length === 0}
                            sx={{ mb: 1 }}
                        >
                            Download Transcript
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* Grading Results Modal */}
            <GradingResultsModal
                open={showGradingModal}
                onClose={() => setShowGradingModal(false)}
                grading={gradingData}
            />

            {/* Help Modal */}
            <HelpModal
                open={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                helpText={helpText}
            />

            {/* Welcome Dialog */}
            <TutorDialogModal
                open={!hasSeenWelcome}
                handleClose={() => setSeenDialog('chat-intro-'+id, true)}
                title={chatData.unit}
                message={chatData.intro}
            />

            {/* Loading Overlay */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
                open={isProcessing}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 3,
                        borderRadius: 2,
                    }}
                >
                    <CircularProgress color="inherit" />
                    <Typography variant="h6">{getLoadingMessage()}</Typography>
                </Box>
            </Backdrop>
        </Grid>
    );
};

export default ChatPage;
