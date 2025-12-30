/**
 * Chat sidebar with turn counter, actions, grading, and export functionality
 */

import { Box, Button, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import GradeChatButton from "../../../components/grade-chat-button/GradeChatButton.tsx";
import GetHelpButton from "../../../components/get-help-button/GetHelpButton.tsx";
import type { ChatAction } from "../../../utils/getChatMetadataById.ts";
import type { ChatGradingResponse } from "../../../types/Grading.ts";

export interface ChatSidebarProps {
    // Turn counter
    turnCount: number;
    maxTurns: number;
    turnsRemaining: number;
    maxTurnsReached: boolean;

    // Actions
    actions?: ChatAction[];
    usedActionIndices: Set<number>;
    onActionClick: (action: ChatAction, index: number) => void;

    // Chat state
    chatId: number | null;
    isSubmitting: boolean;
    isComplete: boolean;
    isGraded: boolean;
    isGrading: boolean;
    messageCount: number;

    // Callbacks
    onHelpReceived: (helpText: string) => void;
    onGradingComplete: (grading: ChatGradingResponse) => void;
    onError: (error: string) => void;
    onExport: () => void;
}

export default function ChatSidebar({
    turnCount,
    maxTurns,
    turnsRemaining,
    maxTurnsReached,
    actions,
    usedActionIndices,
    onActionClick,
    chatId,
    isSubmitting,
    isComplete,
    isGraded,
    isGrading,
    messageCount,
    onHelpReceived,
    onGradingComplete,
    onError,
    onExport,
}: ChatSidebarProps) {
    return (
        <Box
            p={2}
            height="100%"
            display="flex"
            flexDirection="column"
            bgcolor="#f5f5f5"
            borderLeft="1px solid #e0e0e0"
            sx={{ overflowY: 'auto' }}
        >
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
                        textAlign: 'center',
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
                {actions && actions.length > 0
                    ? actions.map((action, index) => (
                          <Button
                              key={index}
                              variant="outlined"
                              size="small"
                              onClick={() => onActionClick(action, index)}
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
                    : null}
            </Stack>

            {/* Complete Chat and Score */}
            <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                    Complete Chat and Score
                </Typography>
                <GetHelpButton
                    chatId={chatId}
                    onHelpReceived={onHelpReceived}
                    onError={onError}
                    disabled={isSubmitting || isComplete || isGraded || maxTurnsReached || isGrading}
                    fullWidth
                />
                <GradeChatButton
                    chatId={chatId}
                    onGradingComplete={onGradingComplete}
                    onError={onError}
                    disabled={isSubmitting || messageCount <= 1 || isGraded}
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
                    onClick={onExport}
                    disabled={messageCount === 0}
                    sx={{ mb: 1 }}
                >
                    Download Transcript
                </Button>
            </Box>
        </Box>
    );
}
