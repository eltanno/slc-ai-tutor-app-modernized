import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GradingResultsModal from '../../../../src/app/components/grading-results-modal/GradingResultsModal';
import type { ChatGradingResponse } from '../../../../src/app/types/Grading';

// Helper to create valid grading data
const createMockGrading = (): ChatGradingResponse => ({
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
  ],
  end_conditions: [
    { condition: 'Introduced self', completed: true, evidence: 'Said hello and gave name' },
  ],
  strengths: ['Good empathy', 'Clear communication'],
  areas_for_improvement: [
    { area: 'Active listening', example: 'Interrupted patient', suggestion: 'Let patient finish speaking' },
  ],
  overall_summary: 'Overall a good performance with room for improvement.',
  recommendations: ['Practice active listening'],
});

describe('GradingResultsModal', () => {
  it('should return null when grading is null', () => {
    const { container } = render(
      <GradingResultsModal open={true} onClose={() => {}} grading={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render dialog with title when open with grading data', () => {
    const grading = createMockGrading();

    render(
      <GradingResultsModal open={true} onClose={() => {}} grading={grading} />
    );

    expect(screen.getByText('Your Performance Results')).toBeInTheDocument();
    // GradingResults component should render the score (may appear multiple times)
    expect(screen.getAllByText('8.3/10').length).toBeGreaterThanOrEqual(1);
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    const grading = createMockGrading();

    render(
      <GradingResultsModal open={true} onClose={mockOnClose} grading={grading} />
    );

    // Click the Close button in DialogActions
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X icon button is clicked', () => {
    const mockOnClose = vi.fn();
    const grading = createMockGrading();

    render(
      <GradingResultsModal open={true} onClose={mockOnClose} grading={grading} />
    );

    // Click the X icon button in the title
    const closeIconButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(closeIconButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
