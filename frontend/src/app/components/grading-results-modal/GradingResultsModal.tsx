/**
 * Modal to display chat grading results
 */

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GradingResults from "../grading-results/GradingResults";
import type { ChatGradingResponse } from "../../types/Grading";

interface GradingResultsModalProps {
    open: boolean;
    onClose: () => void;
    grading: ChatGradingResponse | null;
}

export default function GradingResultsModal({ open, onClose, grading }: GradingResultsModalProps) {
    if (!grading) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
                Your Performance Results
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
                <GradingResults grading={grading} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
