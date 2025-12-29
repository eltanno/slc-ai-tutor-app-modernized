import { describe, it, expect } from 'vitest';
import {
  getChatMetadataById,
  CHAT_METADATA_LIST,
  type ChatMetadata,
} from '../../../src/app/utils/getChatMetadataById';

describe('getChatMetadataById', () => {
  it('should return metadata for valid id', () => {
    const result = getChatMetadataById('unit1_conversation1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('unit1_conversation1');
    expect(result?.unit).toBe('Introducing yourself and welcoming service users');
  });

  it('should return undefined for invalid id', () => {
    const result = getChatMetadataById('nonexistent_conversation');

    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined input', () => {
    const result = getChatMetadataById(undefined);

    expect(result).toBeUndefined();
  });

  it('should find different conversations correctly', () => {
    const unit2conv1 = getChatMetadataById('unit2_conversation1');
    const unit4conv2 = getChatMetadataById('unit4_conversation2');

    expect(unit2conv1).toBeDefined();
    expect(unit2conv1?.id).toBe('unit2_conversation1');

    expect(unit4conv2).toBeDefined();
    expect(unit4conv2?.id).toBe('unit4_conversation2');
  });
});

describe('CHAT_METADATA_LIST', () => {
  it('should contain all 13 conversations', () => {
    expect(CHAT_METADATA_LIST).toHaveLength(13);
  });

  it('should have unique ids for all conversations', () => {
    const ids = CHAT_METADATA_LIST.map((chat: ChatMetadata) => chat.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(CHAT_METADATA_LIST.length);
  });

  it('should have required properties for each conversation', () => {
    for (const chat of CHAT_METADATA_LIST) {
      expect(chat.id).toBeDefined();
      expect(chat.model).toBeDefined();
      expect(chat.unit).toBeDefined();
      expect(chat.intro).toBeDefined();
      expect(chat.avatar_id).toBeDefined();
      expect(chat.resident).toBeDefined();
    }
  });

  it('should include conversations from all units', () => {
    const units = CHAT_METADATA_LIST.map((chat: ChatMetadata) => chat.id.split('_')[0]);
    const uniqueUnits = new Set(units);

    // Should have unit1 through unit8
    expect(uniqueUnits.has('unit1')).toBe(true);
    expect(uniqueUnits.has('unit2')).toBe(true);
    expect(uniqueUnits.has('unit3')).toBe(true);
    expect(uniqueUnits.has('unit4')).toBe(true);
    expect(uniqueUnits.has('unit5')).toBe(true);
    expect(uniqueUnits.has('unit6')).toBe(true);
    expect(uniqueUnits.has('unit7')).toBe(true);
    expect(uniqueUnits.has('unit8')).toBe(true);
  });
});
