import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { resetAuthMocks, setupAuthMocks } from './__mocks__/authMocks';

describe('useAuthSession', () => {
  beforeEach(() => {
    setupAuthMocks();
  });

  afterEach(() => {
    resetAuthMocks();
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should update session when auth state changes', async () => {
    const mockSession = {
      user: { id: 'test-user' },
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
    };

    const { result } = renderHook(() => useAuthSession());

    // Simulate auth state change
    APP_STATE.setSession(mockSession);

    expect(result.current.session).toBe(mockSession);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error state', async () => {
    const mockError = new Error('Auth error');

    const { result } = renderHook(() => useAuthSession());

    // Simulate error
    APP_STATE.setError(mockError);

    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });
});
