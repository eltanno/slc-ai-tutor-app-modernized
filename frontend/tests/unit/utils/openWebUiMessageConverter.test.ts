import { describe, it, expect } from 'vitest';
import {
  convertMessagesToOpenWebUIFormat,
  convertOpenWebUIMessagesToSimple,
  type OpenWebUIMessage,
} from '../../../src/app/utils/openWebUiMessageConverter';

describe('convertMessagesToOpenWebUIFormat', () => {
  it('should return empty structure for empty input', () => {
    const result = convertMessagesToOpenWebUIFormat([], 'test-model');

    expect(result.messages).toEqual({});
    expect(result.currentId).toBeNull();
    expect(result.messageArray).toEqual([]);
  });

  it('should convert a single user message with correct structure', () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const result = convertMessagesToOpenWebUIFormat(messages, 'test-model');

    expect(result.messageArray).toHaveLength(1);
    const msg = result.messageArray[0];

    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello');
    expect(msg.id).toMatch(/^msg-\d+-0$/);
    expect(msg.parentId).toBeNull();
    expect(msg.childrenIds).toEqual([]);
    expect(msg.timestamp).toBeGreaterThan(0);
  });

  it('should link parent/child IDs correctly for user-assistant pair', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];
    const result = convertMessagesToOpenWebUIFormat(messages, 'test-model');

    expect(result.messageArray).toHaveLength(2);

    const userMsg = result.messageArray[0];
    const assistantMsg = result.messageArray[1];

    // User message should have no parent, assistant as child
    expect(userMsg.parentId).toBeNull();
    expect(userMsg.childrenIds).toContain(assistantMsg.id);

    // Assistant message should have user as parent, no children
    expect(assistantMsg.parentId).toBe(userMsg.id);
    expect(assistantMsg.childrenIds).toEqual([]);

    // currentId should be the last message
    expect(result.currentId).toBe(assistantMsg.id);
  });

  it('should include model metadata for assistant messages', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];
    const result = convertMessagesToOpenWebUIFormat(messages, 'gpt-4');

    const assistantMsg = result.messageArray[1];

    expect(assistantMsg.model).toBe('gpt-4');
    expect(assistantMsg.modelName).toBe('gpt-4');
    expect(assistantMsg.modelIdx).toBe(0);
    expect(assistantMsg.userContext).toBeNull();
    expect(assistantMsg.done).toBe(true);
  });

  it('should include models array for user messages', () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const result = convertMessagesToOpenWebUIFormat(messages, 'gpt-4');

    const userMsg = result.messageArray[0];

    expect(userMsg.models).toEqual(['gpt-4']);
    expect(userMsg.model).toBeUndefined();
    expect(userMsg.modelName).toBeUndefined();
  });

  it('should store messages in both record and array format', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi!' },
    ];
    const result = convertMessagesToOpenWebUIFormat(messages, 'test-model');

    // Both formats should have same messages
    expect(Object.keys(result.messages)).toHaveLength(2);
    expect(result.messageArray).toHaveLength(2);

    // Messages should be accessible by ID
    const firstMsgId = result.messageArray[0].id;
    expect(result.messages[firstMsgId]).toBeDefined();
    expect(result.messages[firstMsgId].content).toBe('Hello');
  });
});

describe('convertOpenWebUIMessagesToSimple', () => {
  it('should extract role and content from OpenWebUI messages', () => {
    const openWebUIMessages: OpenWebUIMessage[] = [
      {
        id: 'msg-1',
        parentId: null,
        childrenIds: ['msg-2'],
        role: 'user',
        content: 'Hello',
        timestamp: 1234567890,
        models: ['gpt-4'],
      },
      {
        id: 'msg-2',
        parentId: 'msg-1',
        childrenIds: [],
        role: 'assistant',
        content: 'Hi there!',
        timestamp: 1234567891,
        model: 'gpt-4',
        modelName: 'gpt-4',
        modelIdx: 0,
        done: true,
      },
    ];

    const result = convertOpenWebUIMessagesToSimple(openWebUIMessages);

    expect(result).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ]);
  });

  it('should ignore metadata fields and only return role and content', () => {
    const openWebUIMessages: OpenWebUIMessage[] = [
      {
        id: 'msg-complex',
        parentId: 'parent-id',
        childrenIds: ['child-1', 'child-2'],
        role: 'assistant',
        content: 'Response with metadata',
        timestamp: 9999999999,
        model: 'gpt-4-turbo',
        modelName: 'GPT-4 Turbo',
        modelIdx: 5,
        userContext: null,
        done: true,
      },
    ];

    const result = convertOpenWebUIMessagesToSimple(openWebUIMessages);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: 'assistant',
      content: 'Response with metadata',
    });

    // Ensure no extra properties
    expect(Object.keys(result[0])).toEqual(['role', 'content']);
  });

  it('should return empty array for empty input', () => {
    const result = convertOpenWebUIMessagesToSimple([]);
    expect(result).toEqual([]);
  });
});
