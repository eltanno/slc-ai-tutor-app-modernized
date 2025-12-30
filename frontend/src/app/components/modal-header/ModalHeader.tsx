/**
 * Reusable modal header component with title and close button
 */

import { DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface ModalHeaderProps {
    /** The title text or component */
    title: ReactNode;
    /** Close button click handler */
    onClose: () => void;
    /** Optional icon to display before the title */
    icon?: ReactNode;
    /** Custom styling for the DialogTitle */
    sx?: SxProps<Theme>;
}

export default function ModalHeader({
    title,
    onClose,
    icon,
    sx
}: ModalHeaderProps) {
    return (
        <DialogTitle
            sx={{
                m: 0,
                p: 2,
                pr: 6,
                display: icon ? 'flex' : undefined,
                alignItems: icon ? 'center' : undefined,
                gap: icon ? 1 : undefined,
                ...sx
            }}
        >
            {icon}
            {typeof title === 'string' ? <span>{title}</span> : title}
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
        </DialogTitle>
    );
}
