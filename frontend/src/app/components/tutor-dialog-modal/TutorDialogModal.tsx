import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ChatMessageBox from "../conversation/ChatMessageBox.tsx";

interface TutorDialogModalProps {
    open: boolean;
    handleClose: () => void;
    title: string;
    message: string;
    actions?: React.ReactNode;
}

const TutorDialogModal = ({open, handleClose, title, message, actions}: TutorDialogModalProps) => {
    return (
        <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                {title}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <ChatMessageBox message={{role: "tutor", content: message}} avatarId={"15"} isLeft={false} fullWidth={true} />
            </DialogContent>
            {actions && (
                <DialogActions>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
}

export default TutorDialogModal;
