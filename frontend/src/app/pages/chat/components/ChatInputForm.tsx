/**
 * Chat input form with message text field and send button
 */

import { Box, Button, TextField } from "@mui/material";
import type { FormEvent, ReactNode } from "react";

export interface ChatInputFormProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSubmitting?: boolean;
    errorMessage?: ReactNode;
}

export default function ChatInputForm({
    value,
    onChange,
    onSubmit,
    disabled = false,
    isSubmitting = false,
    errorMessage,
}: ChatInputFormProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            px={2}
            bgcolor="#fff"
            boxShadow={1}
            sx={{
                borderTop: '1px solid #eee',
                minHeight: 72,
                flexShrink: 0,
                justifyContent: 'center',
            }}
        >
            {errorMessage && (
                <Box color="red" mb={1} fontSize={14}>
                    {errorMessage}
                </Box>
            )}
            <Box display="flex" alignItems="center" gap={2}>
                <TextField
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    sx={{ flex: 1 }}
                    disabled={disabled || isSubmitting}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!value.trim() || isSubmitting || disabled}
                    sx={{ minWidth: 100 }}
                    loading={isSubmitting}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
}
