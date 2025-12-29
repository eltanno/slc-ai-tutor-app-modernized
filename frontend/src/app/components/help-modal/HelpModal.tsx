/**
 * Modal to display help advice from the conversation helper tutor
 */

import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography
} from "@mui/material";
import ChatMessageBox from "../conversation/ChatMessageBox";

interface HelpModalProps {
    open: boolean;
    onClose: () => void;
    helpText: string | null;
}

export default function HelpModal({ open, onClose, helpText }: HelpModalProps) {
    if (!helpText) return null;

    // Split into paragraphs (the help tutor returns 2 paragraphs)
    const paragraphs = helpText.split('\n\n').filter(p => p.trim());

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ m: 0, p: 2, pr: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlineIcon color="primary" />
                <span>Tutor's Advice</span>
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
            <DialogContent dividers>
                <ChatMessageBox message={{role: "tutor", content: paragraphs.map(p => p.trim() + "\n\n").join("")}} avatarId={"15"} isLeft={false} fullWidth={true} />

                <Box sx={{ mt: 2, px: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        💡 This is a suggestion to help you continue the conversation.
                        You can use these ideas or try your own approach!
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    Got it, thanks!
                </Button>
            </DialogActions>
        </Dialog>
    );
}
