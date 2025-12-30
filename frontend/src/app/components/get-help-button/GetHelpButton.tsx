/**
 * Button component to request help from the conversation helper LLM
 */

import { useState, useCallback } from "react";
import { Button, CircularProgress } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useGetHelpMutation } from "../../services/Chat.api";
import { extractErrorMessage, hasErrorStatus, errorMessageContains } from "../../utils/errorUtils";

interface GetHelpButtonProps {
    chatId: number | null;
    onHelpReceived?: (helpText: string) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    variant?: "text" | "outlined" | "contained";
    color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
}

export default function GetHelpButton({
    chatId,
    onHelpReceived,
    onError,
    disabled = false,
    variant = "contained",
    color = "success",
    size = "large",
    fullWidth = false,
}: GetHelpButtonProps) {
    const [getHelp] = useGetHelpMutation();
    const [isGettingHelp, setIsGettingHelp] = useState(false);

    const handleGetHelp = useCallback(async () => {
        if (!chatId) {
            onError?.("Chat must be saved before requesting help");
            return;
        }

        setIsGettingHelp(true);

        try {
            const response = await getHelp(chatId);

            if ('data' in response && response.data) {
                onHelpReceived?.(response.data.help_text);
            } else if ('error' in response) {
                // Handle special case: already requested help for this turn
                if (hasErrorStatus(response.error, 400) && errorMessageContains(response.error, 'already been requested')) {
                    onError?.("You've already requested help for this turn. Continue the conversation to request help again.");
                } else {
                    console.error("Help API Error:", response.error);
                    const errorDetail = extractErrorMessage(
                        response.error,
                        "Failed to get help from tutor"
                    );
                    onError?.(`Tutor Error: ${errorDetail}`);
                }
            }
        } catch (err) {
            console.error("Help request error:", err);
            const errorMessage = extractErrorMessage(
                err,
                "An error occurred while getting help"
            );
            onError?.(errorMessage);
        } finally {
            setIsGettingHelp(false);
        }
    }, [chatId, getHelp, onHelpReceived, onError]);

    return (
        <Button
            variant={variant}
            size={size}
            color={color}
            fullWidth={fullWidth}
            onClick={handleGetHelp}
            disabled={disabled || isGettingHelp || !chatId}
            startIcon={isGettingHelp ? <CircularProgress size={16} color="inherit" /> : <HelpOutlineIcon />}
            sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                marginBottom: '8px',
            }}
        >
            {isGettingHelp ? "Getting help..." : "Get Help"}
        </Button>
    );
}
