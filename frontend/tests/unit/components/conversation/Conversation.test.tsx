import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Conversation from '../../../../src/app/components/conversation/Conversation';
import type { ChatMessage } from '../../../../src/app/types/Conversation';

// Mock scrollTo for auto-scroll tests
const mockScrollTo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Mock scrollTo on elements
  Element.prototype.scrollTo = mockScrollTo;
});

describe('Conversation', () => {
  const defaultProps = {
    leftAvatarId: '1',
    rightAvatarId: '9',
  };

  it('should render empty container with no messages', () => {
    render(<Conversation messages={[]} {...defaultProps} />);

    // Should render the container but no message bubbles
    const container = document.querySelector('[class*="MuiBox-root"]');
    expect(container).toBeInTheDocument();
  });

  it('should render user message correctly', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello, how are you?' },
    ];

    render(<Conversation messages={messages} {...defaultProps} />);

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    const messages: ChatMessage[] = [
      { role: 'assistant', content: 'I am doing well, thank you!' },
    ];

    render(<Conversation messages={messages} {...defaultProps} />);

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('should render scenario message with special styling', () => {
    const messages: ChatMessage[] = [
      { role: 'scenario', content: 'The resident becomes agitated' },
    ];

    render(<Conversation messages={messages} {...defaultProps} />);

    const scenarioText = screen.getByText('The resident becomes agitated');
    expect(scenarioText).toBeInTheDocument();

    // Check it's in italic (scenario styling)
    expect(scenarioText).toHaveStyle({ fontStyle: 'italic' });
  });

  it('should scroll to bottom on new message', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'First message' },
    ];

    const { rerender } = render(<Conversation messages={messages} {...defaultProps} />);

    // Add a new message
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'assistant', content: 'Second message' },
    ];

    rerender(<Conversation messages={newMessages} {...defaultProps} />);

    // scrollTo should have been called
    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('should display avatar for each message', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'User message' },
      { role: 'assistant', content: 'Assistant message' },
    ];

    render(<Conversation messages={messages} {...defaultProps} />);

    // Should have avatar images rendered
    const avatarImages = screen.getAllByRole('img');
    expect(avatarImages.length).toBeGreaterThanOrEqual(2);
  });

  it('should render multiple messages in order', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'First' },
      { role: 'assistant', content: 'Second' },
      { role: 'user', content: 'Third' },
    ];

    render(<Conversation messages={messages} {...defaultProps} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
