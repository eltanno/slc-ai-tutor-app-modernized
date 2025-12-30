/**
 * Modal to display chat grading results
 */

import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import GradingResults from "../grading-results/GradingResults";
import ModalHeader from "../modal-header";
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
            <ModalHeader title="Your Performance Results" onClose={onClose} />
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
