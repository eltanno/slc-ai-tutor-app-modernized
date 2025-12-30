/**
 * Reusable empty state component for displaying when there's no data
 */

import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

export interface EmptyStateProps {
    /** The message to display */
    message: string;
    /** Optional icon to display above the message */
    icon?: ReactNode;
    /** Optional secondary message */
    secondaryMessage?: string;
    /** Custom styling */
    sx?: SxProps<Theme>;
}

export default function EmptyState({
    message,
    icon,
    secondaryMessage,
    sx
}: EmptyStateProps) {
    return (
        <Box
            sx={{
                py: 4,
                textAlign: 'center',
                ...sx
            }}
        >
            {icon && (
                <Box sx={{ mb: 2, color: 'text.secondary' }}>
                    {icon}
                </Box>
            )}
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
            {secondaryMessage && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {secondaryMessage}
                </Typography>
            )}
        </Box>
    );
}
