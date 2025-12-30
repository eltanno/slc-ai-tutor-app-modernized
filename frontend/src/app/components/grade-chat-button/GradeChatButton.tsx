/**
 * Button component to trigger chat grading
 */

import { Button, CircularProgress } from "@mui/material";
import { useGradeChatMutation } from "../../services/Chat.api";
import type { ChatGradingResponse } from "../../types/Grading";
import { useMutationHandler } from "../../hooks";

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

    const { isLoading: isGrading, execute } = useMutationHandler(
        gradeChat,
        {
            extractResult: (data) => data.grading,
            defaultErrorMessage: "Failed to get grading response from server",
            onSuccess: onGradingComplete,
            onError: (error) => onError?.(`Grading Error: ${error}`)
        }
    );

    const handleGradeChat = async () => {
        if (!chatId) {
            onError?.("Chat must be saved before grading");
            return;
        }
        await execute(chatId);
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
