/**
 * Component to display chat grading results in a nice UI
 */

import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    Alert,
} from "@mui/material";
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import type { ChatGradingResponse } from "../../types/Grading";

interface GradingResultsProps {
    grading: ChatGradingResponse;
}

export default function GradingResults({ grading }: GradingResultsProps) {
    // Safety check for grading data
    if (!grading || !grading.communication_quality) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Invalid grading data received. Please try grading again.
                </Alert>
            </Box>
        );
    }

    const { communication_quality, required_disclosures, end_conditions, strengths, areas_for_improvement, overall_summary } = grading;
    const percentageScore = (communication_quality.overall_score / 10) * 100;

    // Calculate color based on percentage
    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "success";
        if (percentage >= 60) return "warning";
        return "error";
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Overall Score Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <TrophyIcon fontSize="large" color="primary" />
                        <Box flex={1}>
                            <Typography variant="h4">
                                {communication_quality.overall_score.toFixed(1)}/10
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Overall Score ({percentageScore.toFixed(1)}%)
                            </Typography>
                        </Box>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={percentageScore}
                        color={getScoreColor(percentageScore)}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </CardContent>
            </Card>

            {/* Overall Summary */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1">{overall_summary}</Typography>
            </Alert>

            <Stack spacing={3}>
                {/* Communication Quality and Strengths - Side by side on desktop */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Communication Quality Scores */}
                    <Box sx={{ flex: 1 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Communication Quality
                                </Typography>
                                <Stack spacing={2} mt={2}>
                                    <ScoreBar label="Empathy" score={communication_quality.empathy_score} />
                                    <ScoreBar label="Active Listening" score={communication_quality.active_listening_score} />
                                    <ScoreBar label="Clarity" score={communication_quality.clarity_score} />
                                    <ScoreBar label="Patience" score={communication_quality.patience_score} />
                                    <ScoreBar label="Professionalism" score={communication_quality.professionalism_score} />
                                </Stack>
                                <Divider sx={{ my: 2 }} />
                                <Box textAlign="center">
                                    <Typography variant="h5" color="primary">
                                        {communication_quality.overall_score.toFixed(1)}/10
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Overall Score
                                    </Typography>
                                </Box>
                                {communication_quality.comments && (
                                    <Typography variant="body2" mt={2} color="text.secondary">
                                        {communication_quality.comments}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Strengths */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Strengths
                                </Typography>
                                <List>
                                    {strengths.map((strength: string, index: number) => (
                                        <ListItem key={index} disableGutters>
                                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                            <ListItemText primary={strength} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Required Disclosures Checklist */}
                {required_disclosures && required_disclosures.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Required Information Gathered
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                These are the key pieces of information you needed to find out from the resident:
                            </Typography>
                            <Stack spacing={2} mt={2}>
                                {required_disclosures.map((disclosure, index) => (
                                    <Box key={index}>
                                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                                            {disclosure.achieved ? (
                                                <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
                                            ) : (
                                                <CancelIcon color="error" sx={{ mt: 0.5 }} />
                                            )}
                                            <Box flex={1}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        textDecoration: disclosure.achieved ? 'none' : 'none',
                                                        color: disclosure.achieved ? 'text.primary' : 'text.secondary'
                                                    }}
                                                >
                                                    {disclosure.disclosure}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {disclosure.context}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        {index < required_disclosures.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* End Conditions Checklist */}
                {end_conditions && end_conditions.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Scenario Requirements
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                These are the things you needed to accomplish in this conversation:
                            </Typography>
                            <Stack spacing={2} mt={2}>
                                {end_conditions.map((condition, index) => (
                                    <Box key={index}>
                                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                                            {condition.completed ? (
                                                <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
                                            ) : (
                                                <CancelIcon color="error" sx={{ mt: 0.5 }} />
                                            )}
                                            <Box flex={1}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: condition.completed ? 'text.primary' : 'text.secondary'
                                                    }}
                                                >
                                                    {condition.condition}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {condition.evidence}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        {index < end_conditions.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Areas for Improvement */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <TrendingUpIcon />
                                <span>Areas for Improvement</span>
                            </Stack>
                        </Typography>
                        <Stack spacing={3} mt={2}>
                            {areas_for_improvement.map((area: ChatGradingResponse['areas_for_improvement'][0], index: number) => (
                                <Box key={index}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        {area.area}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        <strong>Example:</strong> {area.example}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Suggestion:</strong> {area.suggestion}
                                    </Typography>
                                    {index < areas_for_improvement.length - 1 && <Divider sx={{ mt: 2 }} />}
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                {grading.recommendations && grading.recommendations.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recommendations for Next Time
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                                {grading.recommendations.map((rec: string, index: number) => (
                                    <Chip key={index} label={rec} color="primary" variant="outlined" />
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}

// Helper component for score bars
function ScoreBar({ label, score }: { label: string; score: number }) {
    const percentage = (score / 10) * 100;
    const getColor = (score: number) => {
        if (score >= 8) return "success";
        if (score >= 6) return "warning";
        return "error";
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" fontWeight="bold">
                    {score.toFixed(1)}/10
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={percentage}
                color={getColor(score)}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
}
