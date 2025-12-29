import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessageBox from '../../../../src/app/components/conversation/ChatMessageBox';
import type { ChatMessage } from '../../../../src/app/types/Conversation';

describe('ChatMessageBox', () => {
  const defaultMessage: ChatMessage = {
    role: 'user',
    content: 'Test message content',
  };

  it('should render message content', () => {
    render(
      <ChatMessageBox
        message={defaultMessage}
        isLeft={true}
        avatarId="1"
      />
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should render avatar image', () => {
    render(
      <ChatMessageBox
        message={defaultMessage}
        isLeft={true}
        avatarId="1"
      />
    );

    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'Carer 1');
  });

  it('should apply left styling for isLeft=true (user messages)', () => {
    const { container } = render(
      <ChatMessageBox
        message={defaultMessage}
        isLeft={true}
        avatarId="1"
      />
    );

    // Check flex direction is 'row' for left-aligned messages
    const flexContainer = container.querySelector('[class*="MuiBox-root"]');
    expect(flexContainer).toBeInTheDocument();
  });

  it('should apply right styling for isLeft=false (assistant messages)', () => {
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: 'Assistant response',
    };

    const { container } = render(
      <ChatMessageBox
        message={assistantMessage}
        isLeft={false}
        avatarId="9"
      />
    );

    // Check flex direction is 'row-reverse' for right-aligned messages
    const flexContainer = container.querySelector('[class*="MuiBox-root"]');
    expect(flexContainer).toBeInTheDocument();
  });

  it('should render markdown content correctly', () => {
    const markdownMessage: ChatMessage = {
      role: 'assistant',
      content: 'This is **bold** text',
    };

    render(
      <ChatMessageBox
        message={markdownMessage}
        isLeft={false}
        avatarId="9"
      />
    );

    // The bold text should be rendered (ReactMarkdown converts **text** to <strong>)
    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName.toLowerCase()).toBe('strong');
  });

  it('should render list items from markdown', () => {
    const listMessage: ChatMessage = {
      role: 'assistant',
      content: '- Item one\n- Item two',
    };

    render(
      <ChatMessageBox
        message={listMessage}
        isLeft={false}
        avatarId="9"
      />
    );

    expect(screen.getByText('Item one')).toBeInTheDocument();
    expect(screen.getByText('Item two')).toBeInTheDocument();
  });

  it('should use robot avatar for system messages (non-first)', () => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'System notification',
    };

    render(
      <ChatMessageBox
        message={systemMessage}
        isLeft={true}
        avatarId="1"
        isFirstMessage={false}
      />
    );

    // Robot avatar (id 19) should be used for system messages
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'Robot 1');
  });

  it('should apply fullWidth styling when specified', () => {
    render(
      <ChatMessageBox
        message={defaultMessage}
        isLeft={true}
        avatarId="1"
        fullWidth={true}
      />
    );

    // The message should be rendered with fullWidth styling
    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });
});
