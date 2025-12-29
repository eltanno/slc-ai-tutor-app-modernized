import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TutorDialogModal from '../../../../src/app/components/tutor-dialog-modal/TutorDialogModal';

describe('TutorDialogModal', () => {
  const defaultProps = {
    open: true,
    handleClose: vi.fn(),
    title: 'Test Dialog Title',
    message: 'This is a test message',
  };

  it('should render dialog with title when open', () => {
    render(<TutorDialogModal {...defaultProps} />);

    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
  });

  it('should render message content via ChatMessageBox', () => {
    render(<TutorDialogModal {...defaultProps} />);

    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should call handleClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<TutorDialogModal {...defaultProps} handleClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when open is false', () => {
    render(<TutorDialogModal {...defaultProps} open={false} />);

    // Dialog content should not be visible
    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    render(
      <TutorDialogModal
        {...defaultProps}
        actions={<button>Custom Action</button>}
      />
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('should not render actions section when actions prop is not provided', () => {
    const { container } = render(<TutorDialogModal {...defaultProps} />);

    // DialogActions should not be in the DOM when no actions provided
    const dialogActions = container.querySelector('.MuiDialogActions-root');
    expect(dialogActions).not.toBeInTheDocument();
  });
});
