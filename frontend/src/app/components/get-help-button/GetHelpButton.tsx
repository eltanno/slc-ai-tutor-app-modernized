/**
 * Button component to request help from the conversation helper LLM
 */

import { useState } from "react";
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

    const handleGetHelp = async () => {
        if (!chatId) {
            if (onError) {
                onError("Chat must be saved before requesting help");
            }
            return;
        }

        setIsGettingHelp(true);

        try {
            // Send help request to Django API
            const response = await getHelp(chatId);

            if ('data' in response && response.data) {
                const helpText = response.data.help_text;

                if (onHelpReceived) {
                    onHelpReceived(helpText);
                }
            } else if ('error' in response) {
                // If it's a 400 error about already requested, show a more user-friendly message
                if (hasErrorStatus(response.error, 400) && errorMessageContains(response.error, 'already been requested')) {
                    if (onError) {
                        onError("You've already requested help for this turn. Continue the conversation to request help again.");
                    }
                } else {
                    console.error("Help API Error:", response.error);
                    const errorDetail = extractErrorMessage(
                        response.error,
                        "Failed to get help from tutor"
                    );
                    if (onError) {
                        onError(`Tutor Error: ${errorDetail}`);
                    }
                }
            }
        } catch (err) {
            console.error("Help request error:", err);
            const errorMessage = extractErrorMessage(
                err,
                "An error occurred while getting help"
            );
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsGettingHelp(false);
        }
    };

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
