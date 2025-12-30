import { Box, Grid } from "@mui/material";
import { useSendMessageMutation, useGetChatQuery } from "../../services/Chat.api.ts";
import { useEffect, useState } from "react";
import Conversation from "../../components/conversation/Conversation.tsx";
import usePreferences from "../../utils/usePreferences.ts";
import { useParams } from "react-router-dom";
import TutorDialogModal from "../../components/tutor-dialog-modal/TutorDialogModal.tsx";
import GradingResultsModal from "../../components/grading-results-modal/GradingResultsModal.tsx";
import HelpModal from "../../components/help-modal/HelpModal.tsx";
import { extractErrorMessage } from "../../utils/errorUtils";
import { logger } from "../../utils/logger";
import type { ChatAction, ChatMetadata } from "../../utils/getChatMetadataById.ts";
import type { ChatMessage } from "../../services/Chat.api.ts";
import type { ChatGradingResponse } from "../../types/Grading.ts";
import { ChatInputForm, ChatSidebar, LoadingOverlay } from "./components";

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
        pollingInterval: isProcessing ? 2000 : 0,
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
    const isGraded = !!activeChatData?.chat?.grading_data && !('error' in activeChatData.chat.grading_data);

    // Get loading message based on status
    const getLoadingMessage = () => {
        if (activeStatus === 'thinking') return 'AI is thinking...';
        if (activeStatus === 'in_progress') return 'Processing your message...';
        if (activeStatus === 'getting_help') return <>Getting help from tutor,<br />This may take a couple of minutes,<br />please be patient...</>;
        if (activeStatus === 'grading') return <>Grading your conversation,<br />This may take up to 5 minutes,<br />please be patient or check back later...</>;
        return 'Processing...';
    };

    // Update messages and turn count from fetched data
    useEffect(() => {
        if (activeChatData?.chat) {
            const fetchedChat = activeChatData.chat;

            if (fetchedChat.messages && fetchedChat.messages.length > 0) {
                setMessages(fetchedChat.messages);
                const userMessageCount = fetchedChat.messages.filter(m => m.role === 'user').length;
                setTurnCount(userMessageCount);

                // Track which actions have been used by checking for scenario messages
                if (chatData?.actions) {
                    const usedIndices = new Set<number>();
                    fetchedChat.messages.forEach(msg => {
                        if (msg.role === 'scenario') {
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
                if ('error' in fetchedChat.grading_data) {
                    logger.error('Grading failed:', fetchedChat.grading_data.error);
                    setErrorMessage(`Grading failed: ${fetchedChat.grading_data.error}`);
                } else if (fetchedChat.grading_data.communication_quality) {
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
                    logger.error('Help request failed:', latestHelp.help_text);
                    setErrorMessage(`Help request failed: ${latestHelp.help_text}`);
                }
            }
        }
    }, [activeChatData, gradingData, helpText, chatData]);

    const handleSend = async () => {
        if (!input.trim() || maxTurnsReached || !djangoChatId) return;
        setIsSubmitting(true);
        try {
            setTurnCount(prev => prev + 1);
            const userMessageText = input;
            setInput("");

            const messageResponse = await sendMessage({
                chatId: djangoChatId,
                message: userMessageText,
            });

            if ('error' in messageResponse) {
                setErrorMessage(extractErrorMessage(messageResponse.error, "Failed to send message"));
            }
        } catch (e) {
            setErrorMessage(extractErrorMessage(e, "An error occurred"));
        }
        setIsSubmitting(false);
    };

    const handleActionClick = async (action: ChatAction, actionIndex: number) => {
        if (usedActionIndices.has(actionIndex) || maxTurnsReached || !djangoChatId) {
            return;
        }

        setIsSubmitting(true);
        try {
            setTurnCount(prev => prev + 1);
            setUsedActionIndices(prev => new Set([...prev, actionIndex]));

            const messageResponse = await sendMessage({
                chatId: djangoChatId,
                message: action.prompt,
                isAction: true,
            });

            if ('error' in messageResponse) {
                setErrorMessage(extractErrorMessage(messageResponse.error, "Failed to send action"));
            }
        } catch (e) {
            setErrorMessage(extractErrorMessage(e, "An error occurred"));
        }
        setIsSubmitting(false);
    };

    const handleExportChat = () => {
        if (!activeChatData?.chat) return;

        const chat = activeChatData.chat;
        const chatTitle = chat.title || 'Untitled Chat';
        const timestamp = new Date().toLocaleString();
        const residentName = chatData?.resident?.name || 'AI Tutor';

        let scoreText = 'Incomplete';
        if (chat.grading_data && !('error' in chat.grading_data)) {
            const gradingResponse = chat.grading_data as ChatGradingResponse;
            scoreText = gradingResponse.communication_quality?.overall_score?.toString() || 'N/A';
        }

        let transcript = `Chat Transcript: ${chatTitle}\n`;
        transcript += `Exported: ${timestamp}\n`;
        transcript += `Total Messages: ${messages.length}\n`;
        transcript += `Turn Count: ${turnCount}\n`;
        transcript += `Score: ${scoreText}\n`;
        transcript += `\n${'='.repeat(60)}\n\n`;

        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'Student' :
                        msg.role === 'assistant' ? residentName :
                        msg.role === 'scenario' ? 'Scenario' :
                        msg.role.charAt(0).toUpperCase() + msg.role.slice(1);

            transcript += `[${index + 1}] ${role}:\n`;
            transcript += `${msg.content}\n\n`;
        });

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

    if (!chatData) {
        return <Box p={2}>Chat not found</Box>;
    }

    return (
        <Grid container sx={{ width: "100%", height: `calc(100vh - 105px)`, backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
            <Grid size={10} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box id="chat-area" sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fafafa', p: 2 }}>
                        <Conversation messages={messages} leftAvatarId={userAvatarId} rightAvatarId={chatData.avatar_id} />
                    </Box>
                    <ChatInputForm
                        value={input}
                        onChange={setInput}
                        onSubmit={handleSend}
                        disabled={maxTurnsReached}
                        isSubmitting={isSubmitting}
                        errorMessage={errorMessage}
                    />
                </Box>
            </Grid>
            <Grid size={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChatSidebar
                    turnCount={turnCount}
                    maxTurns={maxTurns}
                    turnsRemaining={turnsRemaining}
                    maxTurnsReached={maxTurnsReached}
                    actions={chatData.actions}
                    usedActionIndices={usedActionIndices}
                    onActionClick={handleActionClick}
                    chatId={djangoChatId}
                    isSubmitting={isSubmitting}
                    isComplete={isComplete}
                    isGraded={isGraded}
                    isGrading={chatStatus === 'grading'}
                    messageCount={messages.length}
                    onHelpReceived={(help) => {
                        setHelpText(help);
                        setShowHelpModal(true);
                    }}
                    onGradingComplete={(grading) => {
                        setGradingData(grading);
                        setShowGradingModal(true);
                    }}
                    onError={setErrorMessage}
                    onExport={handleExportChat}
                />
            </Grid>

            <GradingResultsModal
                open={showGradingModal}
                onClose={() => setShowGradingModal(false)}
                grading={gradingData}
            />

            <HelpModal
                open={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                helpText={helpText}
            />

            <TutorDialogModal
                open={!hasSeenWelcome}
                handleClose={() => setSeenDialog('chat-intro-' + id, true)}
                title={chatData.unit}
                message={chatData.intro}
            />

            <LoadingOverlay open={isProcessing} message={getLoadingMessage()} />
        </Grid>
    );
};

export default ChatPage;
