/**
 * Loading overlay backdrop for chat processing states
 */

import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import type { ReactNode } from "react";

export interface LoadingOverlayProps {
    open: boolean;
    message: ReactNode;
}

export default function LoadingOverlay({ open, message }: LoadingOverlayProps) {
    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                position: 'absolute',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
            open={open}
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
                <Typography variant="h6">{message}</Typography>
            </Box>
        </Backdrop>
    );
}
