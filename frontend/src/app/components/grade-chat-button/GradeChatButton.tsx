/**
 * Button component to trigger chat grading
 */

import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useGradeChatMutation } from "../../services/Chat.api";
import type { ChatGradingResponse } from "../../types/Grading";

interface GradeChatButtonProps {
    chatId: number | null;
    onGradingComplete?: (grading: ChatGradingResponse) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    variant?: "text" | "outlined" | "contained";
    color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
    children?: React.ReactNode;
}

export default function GradeChatButton({
    chatId,
    onGradingComplete,
    onError,
    disabled = false,
    variant = "contained",
    color = "success",
    size = "large",
    fullWidth = false,
    children = "Complete Chat and Score"
}: GradeChatButtonProps) {
    const [gradeChat] = useGradeChatMutation();
    const [isGrading, setIsGrading] = useState(false);

    const handleGradeChat = async () => {
        if (!chatId) {
            if (onError) {
                onError("Chat must be saved before grading");
            }
            return;
        }

        setIsGrading(true);

        try {
            console.log("Sending grading request for chat ID:", chatId);

            // Send grading request to Django API
            const response = await gradeChat(chatId);

            console.log("Grading response:", response);

            if ('data' in response && response.data) {
                const grading = response.data.grading;

                if (onGradingComplete) {
                    onGradingComplete(grading);
                }

                // Show message if it was already graded
                if (response.data.message?.includes('already graded')) {
                    console.log("Returning cached grading results");
                }
            } else if ('error' in response) {
                // Extract detailed error information
                const error = response.error as { data?: { detail?: string; message?: string }; message?: string };
                const errorDetail = error?.data?.detail ||
                                   error?.data?.message ||
                                   error?.message ||
                                   "Failed to get grading response from server";
                console.error("Grading API Error:", response.error);
                if (onError) {
                    onError(`Grading Error: ${errorDetail}`);
                }
            }
        } catch (err) {
            console.error("Grading error:", err);
            const error = err as { data?: { detail?: string; message?: string }; message?: string };
            const errorMessage = error?.data?.detail ||
                                error?.data?.message ||
                                error?.message ||
                                "An error occurred while grading the chat";
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsGrading(false);
        }
    };

    return (
        <Button
            variant={variant}
            color={color}
            size={size}
            fullWidth={fullWidth}
            onClick={handleGradeChat}
            disabled={disabled || isGrading || !chatId}
            sx={{
                textTransform: 'none',
            }}
        >
            {isGrading ? (
                <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Grading...
                </>
            ) : (
                children
            )}
        </Button>
    );
}
