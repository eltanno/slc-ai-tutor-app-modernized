/**
 * Reusable wrapper component for handling async data loading states
 * Displays loading spinner, error alert, or empty state as appropriate
 */

import { Box, CircularProgress, Alert, Container } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import EmptyState from "../empty-state";

export interface AsyncDataWrapperProps {
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error object if an error occurred */
    error?: unknown;
    /** Error message to display (defaults to generic message) */
    errorMessage?: string;
    /** Whether to show empty state (typically when data.length === 0) */
    isEmpty?: boolean;
    /** Message to show when empty */
    emptyMessage?: string;
    /** Icon to show in empty state */
    emptyIcon?: ReactNode;
    /** Content to render when data is available */
    children: ReactNode;
    /** Whether to wrap in Container (for page-level usage) */
    useContainer?: boolean;
    /** Container max width */
    containerMaxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Custom styling for the wrapper */
    sx?: SxProps<Theme>;
}

export default function AsyncDataWrapper({
    isLoading,
    error,
    errorMessage = "Failed to load data. Please try again later.",
    isEmpty = false,
    emptyMessage = "No data found.",
    emptyIcon,
    children,
    useContainer = false,
    containerMaxWidth = "lg",
    sx
}: AsyncDataWrapperProps) {
    // Loading state
    if (isLoading) {
        const loadingContent = (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, ...sx }}>
                <CircularProgress />
            </Box>
        );

        return useContainer ? (
            <Container maxWidth={containerMaxWidth} sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        ) : loadingContent;
    }

    // Error state
    if (error) {
        const errorContent = (
            <Alert severity="error" sx={sx}>
                {errorMessage}
            </Alert>
        );

        return useContainer ? (
            <Container maxWidth={containerMaxWidth} sx={{ py: 4 }}>
                {errorContent}
            </Container>
        ) : errorContent;
    }

    // Empty state
    if (isEmpty) {
        return <EmptyState message={emptyMessage} icon={emptyIcon} sx={sx} />;
    }

    // Normal state - render children
    return <>{children}</>;
}
