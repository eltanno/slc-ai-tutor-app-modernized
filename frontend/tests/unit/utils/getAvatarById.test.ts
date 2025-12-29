import { describe, it, expect } from 'vitest';
import {
  getAvatarById,
  AVATAR_LIST,
  type UserAvatar,
} from '../../../src/app/utils/getAvatarById';

describe('getAvatarById', () => {
  it('should return avatar for valid id "1"', () => {
    const result = getAvatarById('1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('1');
    expect(result?.label).toBe('Carer 1');
  });

  it('should return undefined for invalid id "999"', () => {
    const result = getAvatarById('999');

    expect(result).toBeUndefined();
  });

  it('should handle string ids correctly', () => {
    // Test various string IDs
    const avatar5 = getAvatarById('5');
    const avatar15 = getAvatarById('15');
    const avatar25 = getAvatarById('25');

    expect(avatar5?.id).toBe('5');
    expect(avatar5?.label).toBe('Carer 5');

    expect(avatar15?.id).toBe('15');
    expect(avatar15?.label).toBe('Tutor 1');

    expect(avatar25?.id).toBe('25');
    expect(avatar25?.label).toBe('Resident 12');
  });
});

describe('AVATAR_LIST', () => {
  it('should contain all 25 avatars', () => {
    expect(AVATAR_LIST).toHaveLength(25);
  });

  it('should have unique ids for all avatars', () => {
    const ids = AVATAR_LIST.map((avatar: UserAvatar) => avatar.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(AVATAR_LIST.length);
  });

  it('should have required properties for each avatar', () => {
    for (const avatar of AVATAR_LIST) {
      expect(avatar.id).toBeDefined();
      expect(avatar.src).toBeDefined();
      expect(avatar.label).toBeDefined();
    }
  });
});
