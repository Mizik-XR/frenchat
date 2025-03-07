
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { APP_STATE } from "@/integrations/supabase/client";
import { resetAuthMocks, setupAuthMocks } from "./__mocks__/authMocks";

// Mock the hooks that useAuthSession depends on
vi.mock("@/hooks/auth/authActions", () => ({
  useSignOut: vi.fn().mockReturnValue(vi.fn())
}));

vi.mock("@/hooks/auth/authEventHandlers", () => ({
  useAuthStateChangeHandler: vi.fn().mockReturnValue(vi.fn()),
  useInitialSessionCheck: vi.fn().mockReturnValue(vi.fn(() => Promise.resolve()))
}));

describe("useAuthSession", () => {
  beforeEach(() => {
    vi.resetModules();
    resetAuthMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useAuthSession());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.signOut).toBeDefined();
    expect(result.current.isOfflineMode).toBe(APP_STATE.isOfflineMode);
    expect(typeof result.current.toggleOfflineMode).toBe("function");
  });

  it("should toggle offline mode", () => {
    const { result } = renderHook(() => useAuthSession());
    const originalOfflineMode = APP_STATE.isOfflineMode;
    
    act(() => {
      result.current.toggleOfflineMode();
    });
    
    expect(result.current.isOfflineMode).toBe(!originalOfflineMode);
    
    // Reset to original state
    APP_STATE.setOfflineMode(originalOfflineMode);
  });

  it("should handle storage events for offline mode", () => {
    const { result } = renderHook(() => useAuthSession());
    const originalOfflineMode = APP_STATE.isOfflineMode;
    
    // Simulate storage event
    act(() => {
      APP_STATE.setOfflineMode(!originalOfflineMode);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'OFFLINE_MODE',
        newValue: String(!originalOfflineMode)
      }));
    });
    
    expect(result.current.isOfflineMode).toBe(!originalOfflineMode);
    
    // Reset to original state
    APP_STATE.setOfflineMode(originalOfflineMode);
  });

  it("should have auth state change listener", () => {
    // This test is more about ensuring the hook sets up correctly
    // rather than testing the actual auth state change functionality
    // which is tested in authEventHandlers.test.ts
    
    const { result, unmount } = renderHook(() => useAuthSession());
    
    expect(result.current.isLoading).toBe(true);
    
    // Clean up
    unmount();
  });

  // Add more specific tests for the hook's behavior
  // Note: Many of the functionalities are tested in the separate
  // test files for the smaller components
});
