import { supabase } from "@/integrations/supabase/client";
import { vi } from "vitest";
import { Session, User } from "@supabase/supabase-js";
import { jest } from '@jest/globals';
import { APP_STATE } from '@/compatibility/supabaseCompat';

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
    APP_STATE: {
      isOfflineMode: false,
      setOfflineMode: vi.fn(),
    },
  };
});

// Mock React Router
vi.mock("react-router-dom", () => {
  return {
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    useLocation: vi.fn().mockReturnValue({
      pathname: "/test",
      search: "",
      hash: "",
      state: null,
      key: "default",
    }),
  };
});

// Mock the toast
vi.mock("sonner", () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

// Helper function to create a mock user
export const getMockUser = (overrides = {}): User => ({
  id: "mock-user-id",
  email: "user@example.com",
  role: "authenticated",
  aud: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  ...overrides,
});

export const getMockSession = (overrides = {}): Session => ({
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Date.now() + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user: getMockUser(),
  ...overrides,
});

export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
  },
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
};

// Setup function to configure mocks with specific returns
export const setupAuthMocks = () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock APP_STATE methods
  jest.spyOn(APP_STATE, 'isOfflineMode');
  jest.spyOn(APP_STATE, 'setOfflineMode');
  jest.spyOn(APP_STATE, 'logSupabaseError');

  supabase.auth.getSession.mockResolvedValue(mockSession);
  supabase.auth.signOut.mockResolvedValue({ error: null });
  
  // Mock the from().select() chain for profile query
  const selectMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const singleMock = vi.fn().mockResolvedValue({ data: mockSession.user, error: null });
  
  supabase.from.mockImplementation((table) => {
    if (table === 'user_profiles') {
      return {
        select: selectMock,
        eq: eqMock,
        single: singleMock
      };
    } else if (table === 'service_configurations') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      };
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    };
  });

  return {
    supabase,
    selectMock,
    eqMock,
    singleMock
  };
};

// Reset all mocks
export const resetAuthMocks = () => {
  // Reset all mocks
  vi.resetAllMocks();
  
  // Reset APP_STATE
  APP_STATE.setOfflineMode(false);
  APP_STATE.clearErrorLog();
  
  // Clear localStorage
  window.localStorage.clear();
};
