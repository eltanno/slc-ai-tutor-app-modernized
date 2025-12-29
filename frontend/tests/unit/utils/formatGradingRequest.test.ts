import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatGradingRequest,
  prepareGradingMessages,
  type ChatMetadata,
} from '../../../src/app/utils/formatGradingRequest';
import type { ChatMessage } from '../../../src/app/services/Chat.api';

// Helper to create minimal chat metadata for testing
const createTestMetadata = (overrides: Partial<ChatMetadata> = {}): ChatMetadata => ({
  id: 'test-chat-1',
  model: 'test-model',
  avatar_id: 'avatar-1',
  unit: 'Unit 1',
  intro: 'Test introduction',
  resident: { name: 'Test Resident' },
  ...overrides,
});

describe('formatGradingRequest', () => {
  it('should format user messages as LEARNER', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello, how are you?' },
    ];

    const result = formatGradingRequest(metadata, messages);

    expect(result).toContain('LEARNER: Hello, how are you?');
  });

  it('should format assistant messages as RESIDENT', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'assistant', content: 'I am doing well, thank you!' },
    ];

    const result = formatGradingRequest(metadata, messages);

    expect(result).toContain('RESIDENT: I am doing well, thank you!');
  });

  it('should format scenario messages as [ACTION TAKEN]', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'scenario', content: 'Patient becomes agitated' },
    ];

    const result = formatGradingRequest(metadata, messages);

    expect(result).toContain('[ACTION TAKEN]: Patient becomes agitated');
  });

  it('should exclude system messages from transcript', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];

    const result = formatGradingRequest(metadata, messages);

    expect(result).not.toContain('You are a helpful assistant');
    expect(result).not.toContain('SYSTEM:');
    expect(result).toContain('LEARNER: Hello');
    expect(result).toContain('RESIDENT: Hi there');
  });

  it('should include chat metadata as JSON block', () => {
    const metadata = createTestMetadata({
      id: 'chat-123',
      model: 'gpt-4',
      unit: 'Communication Skills',
    });
    const messages: ChatMessage[] = [];

    const result = formatGradingRequest(metadata, messages);

    expect(result).toContain('# CHAT METADATA');
    expect(result).toContain('```json');
    expect(result).toContain('"id": "chat-123"');
    expect(result).toContain('"model": "gpt-4"');
    expect(result).toContain('"unit": "Communication Skills"');
  });
});

describe('prepareGradingMessages', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should return array with single user message', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Test message' },
    ];

    const result = prepareGradingMessages(metadata, messages);

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('user');
    expect(result[0].content).toContain('LEARNER: Test message');
  });

  it('should log token estimate to console', () => {
    const metadata = createTestMetadata();
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];

    prepareGradingMessages(metadata, messages);

    expect(consoleSpy).toHaveBeenCalledWith('📊 Grading Prompt Stats:');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Characters:'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Estimated tokens:'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Messages in conversation:'));
  });
});
