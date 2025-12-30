/**
 * Reusable chat list item component
 * Used in ChatListPage and UserChatsList
 */

import {
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Typography,
    Chip,
    IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import type { ReactNode } from "react";
import { formatDate } from "../../utils/dateUtils";

export interface ChatListItemProps {
    /** Chat ID */
    id: number;
    /** Chat title */
    title: string | null;
    /** Whether the chat is completed */
    completed: boolean;
    /** Last updated timestamp */
    updatedAt: string;
    /** Number of interactions/messages */
    interactionCount: number;
    /** Optional score (null if not graded) */
    score: number | null;
    /** Optional avatar ID */
    avatarId?: string | null;
    /** Whether this item is currently selected */
    isSelected?: boolean;
    /** Click handler */
    onClick: (id: number) => void;
    /** Optional delete handler (if provided, shows delete button) */
    onDelete?: (event: React.MouseEvent, id: number) => void;
    /** Whether delete is in progress */
    isDeleting?: boolean;
    /** Optional additional actions to render */
    additionalActions?: ReactNode;
}

export default function ChatListItem({
    id,
    title,
    completed,
    updatedAt,
    interactionCount,
    score,
    avatarId,
    isSelected = false,
    onClick,
    onDelete,
    isDeleting = false,
    additionalActions
}: ChatListItemProps) {
    return (
        <ListItem
            disablePadding
            sx={{
                mb: 1,
                borderRadius: 1,
                border: 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'action.selected' : 'background.paper'
            }}
            secondaryAction={
                onDelete ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {additionalActions}
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={(e) => onDelete(e, id)}
                            disabled={isDeleting}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ) : additionalActions
            }
        >
            <ListItemButton onClick={() => onClick(id)}>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" component="span">
                                {title || 'Untitled Chat'}
                            </Typography>
                            {completed && (
                                <Chip label="Completed" size="small" color="success" />
                            )}
                        </Box>
                    }
                    secondary={
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Last updated: {formatDate(updatedAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {interactionCount} {interactionCount === 1 ? 'message' : 'messages'}
                                {score !== null && ` • Score: ${score.toFixed(1)}`}
                            </Typography>
                            {avatarId && (
                                <Typography variant="caption" color="text.secondary">
                                    Avatar: {avatarId}
                                </Typography>
                            )}
                        </Box>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
}
