import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GradingResults from '../../../../src/app/components/grading-results/GradingResults';
import type { ChatGradingResponse } from '../../../../src/app/types/Grading';

// Helper to create valid grading data
const createMockGrading = (overrides: Partial<ChatGradingResponse> = {}): ChatGradingResponse => ({
  communication_quality: {
    empathy_score: 8.5,
    active_listening_score: 7.5,
    clarity_score: 9.0,
    patience_score: 8.0,
    professionalism_score: 8.5,
    overall_score: 8.3,
    comments: 'Good communication overall',
  },
  required_disclosures: [
    { disclosure: 'Patient name', achieved: true, context: 'Correctly asked for name' },
    { disclosure: 'Symptoms', achieved: false, context: 'Did not ask about symptoms' },
  ],
  end_conditions: [
    { condition: 'Introduced self', completed: true, evidence: 'Said hello and gave name' },
  ],
  strengths: ['Good empathy', 'Clear communication'],
  areas_for_improvement: [
    { area: 'Active listening', example: 'Interrupted patient', suggestion: 'Let patient finish speaking' },
  ],
  overall_summary: 'Overall a good performance with room for improvement.',
  recommendations: ['Practice active listening', 'Ask more open questions'],
  ...overrides,
});

describe('GradingResults', () => {
  it('should render overall score prominently', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    // Score should appear multiple times (header and communication quality section)
    expect(screen.getAllByText('8.3/10').length).toBeGreaterThanOrEqual(1);
  });

  it('should render category breakdown scores', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Empathy')).toBeInTheDocument();
    // Scores may appear multiple times (in header and breakdown), use getAllByText
    expect(screen.getAllByText('8.5/10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Active Listening')).toBeInTheDocument();
    expect(screen.getAllByText('7.5/10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Clarity')).toBeInTheDocument();
    expect(screen.getAllByText('9.0/10').length).toBeGreaterThanOrEqual(1);
  });

  it('should render feedback text (overall summary)', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Overall a good performance with room for improvement.')).toBeInTheDocument();
  });

  it('should render strengths list', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText('Good empathy')).toBeInTheDocument();
    expect(screen.getByText('Clear communication')).toBeInTheDocument();
  });

  it('should render areas for improvement', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    expect(screen.getByText('Active listening')).toBeInTheDocument();
  });

  it('should render required disclosures when present', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Required Information Gathered')).toBeInTheDocument();
    expect(screen.getByText('Patient name')).toBeInTheDocument();
    expect(screen.getByText('Symptoms')).toBeInTheDocument();
  });

  it('should render recommendations as chips', () => {
    const grading = createMockGrading();
    render(<GradingResults grading={grading} />);

    expect(screen.getByText('Recommendations for Next Time')).toBeInTheDocument();
    expect(screen.getByText('Practice active listening')).toBeInTheDocument();
    expect(screen.getByText('Ask more open questions')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const grading = createMockGrading({
      required_disclosures: [],
      end_conditions: [],
      recommendations: [],
    });

    render(<GradingResults grading={grading} />);

    // Should still render without crashing
    // Score may appear multiple times
    expect(screen.getAllByText('8.3/10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Strengths')).toBeInTheDocument();
  });

  it('should show error alert for invalid grading data', () => {
    // @ts-expect-error - testing invalid data
    render(<GradingResults grading={null} />);

    expect(screen.getByText(/Invalid grading data/)).toBeInTheDocument();
  });

  it('should show error alert when communication_quality is missing', () => {
    const invalidGrading = {
      strengths: [],
      areas_for_improvement: [],
      overall_summary: 'test',
      recommendations: [],
      required_disclosures: [],
      end_conditions: [],
    } as unknown as ChatGradingResponse;

    render(<GradingResults grading={invalidGrading} />);

    expect(screen.getByText(/Invalid grading data/)).toBeInTheDocument();
  });
});
