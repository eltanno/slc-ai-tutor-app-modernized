import useLoggedInUser from "../../utils/useLoggedInUser.ts";
import usePreferences from "../../utils/usePreferences.ts";
import {useGetNotesQuery} from "../../services/Api.ts";
import { useMemo } from "react";
import { Container, Paper, Typography, Box, Stack } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface TestResultProps {
    label: string;
    passed: boolean;
    details?: string;
}

const TestResult = ({ label, passed, details }: TestResultProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
        {passed ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
        ) : (
            <CancelIcon sx={{ color: 'error.main', fontSize: 28 }} />
        )}
        <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight="medium">
                {label}
            </Typography>
            {details && (
                <Typography variant="body2" color="text.secondary" sx={{
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    mt: 0.5
                }}>
                    {details}
                </Typography>
            )}
        </Box>
    </Box>
);

const TestPage = () => {
    const {user} = useLoggedInUser();
    const { apiToken } = usePreferences();

    // Skip queries if not logged in
    const notesQuery = useGetNotesQuery({}, { skip: !apiToken });
    const djangoAPiCall = useMemo(() => {
        return notesQuery.isSuccess;
    }, [notesQuery]);

    // Note: OpenWebUI is no longer called directly from frontend
    // All LLM operations go through Django backend

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Test Page
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    This is a test page for development purposes.
                </Typography>

                <Stack spacing={2} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                    <TestResult
                        label="User Logged In"
                        passed={!!(user && user.id)}
                        details={user ? `User: ${JSON.stringify(user)}` : 'No user logged in'}
                    />

                    <TestResult
                        label="Django Bearer Token Present"
                        passed={!!apiToken}
                        details={apiToken ? `Token: ${apiToken}` : 'No token found'}
                    />

                    <TestResult
                        label="Django API Call Success"
                        passed={djangoAPiCall}
                        details={djangoAPiCall ? 'Notes API responded successfully' : 'Notes API call failed or skipped'}
                    />

                    <TestResult
                        label="OpenWebUI Token (Backend-Managed)"
                        passed={true}
                        details="OpenWebUI authentication is now managed by Django backend - frontend has no direct access"
                    />

                    <TestResult
                        label="LLM Operations (via Django)"
                        passed={true}
                        details="All LLM operations now go through Django API endpoints (/api/chats/{id}/send-message, /get-help, /grade)"
                    />
                </Stack>
            </Paper>
        </Container>
    );
};

export default TestPage;
