import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { getProfile, updateProfile } from '@/utils/auth/profileUtils';
import { supabase } from '@/compatibility/supabaseCompat';

jest.mock('@/compatibility/supabaseCompat', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  },
}));

describe('profileUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch profile successfully', async () => {
      const mockProfile = {
        id: 'test-user',
        is_first_login: true,
      };

      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      const result = await getProfile('test-user');
      expect(result).toEqual({
        data: mockProfile,
        error: null,
      });
    });

    it('should handle profile fetch error', async () => {
      const mockError = new Error('Profile not found');

      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      const result = await getProfile('test-user');
      expect(result).toEqual({
        data: null,
        error: mockError,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockProfile = {
        id: 'test-user',
      };

      (supabase.eq as jest.Mock).mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      const result = await updateProfile('test-user', { is_first_login: false });
      expect(result).toEqual({
        data: mockProfile,
        error: null,
      });
    });

    it('should handle profile update error', async () => {
      const mockError = new Error('Update failed');

      (supabase.eq as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      const result = await updateProfile('test-user', { is_first_login: false });
      expect(result).toEqual({
        data: null,
        error: mockError,
      });
    });
  });
});
