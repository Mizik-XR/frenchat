
import { supabase } from "@/integrations/supabase/client";
import { vi } from "vitest";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    handleProfileQuery: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnValue({
        data: null,
        error: null
      }),
    }),
  };

  const mockAppState = {
    isOfflineMode: false,
    setOfflineMode: vi.fn(),
  };

  return {
    supabase: mockSupabase,
    APP_STATE: mockAppState,
  };
});

// Mock react-router-dom
vi.mock("react-router-dom", () => {
  return {
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    useLocation: vi.fn().mockReturnValue({
      pathname: "/",
      search: "",
      state: null,
    }),
  };
});

// Mock the toast
vi.mock("@/hooks/use-toast", () => {
  return {
    toast: vi.fn(),
  };
});

// Create mock functions for ease of reuse
export const getMockUser = (overrides = {}) => ({
  id: "mock-user-id",
  email: "test@example.com",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  ...overrides,
});

export const getMockSession = (overrides = {}) => ({
  access_token: "mock-access-token",
  expires_at: Date.now() + 3600,
  refresh_token: "mock-refresh-token",
  user: getMockUser(),
  ...overrides,
});

// Helper to setup auth mocks with specific return values
export const setupAuthMocks = ({
  getSessionReturn = { data: { session: null }, error: null },
  signOutReturn = { error: null },
  profileQueryReturn = { data: null, error: null },
  configQueryReturn = { data: [], error: null },
} = {}) => {
  supabase.auth.getSession.mockResolvedValue(getSessionReturn);
  supabase.auth.signOut.mockResolvedValue(signOutReturn);
  supabase.handleProfileQuery.mockResolvedValue(profileQueryReturn);
  
  // Mock the from().select() chain for service configurations
  const selectMock = vi.fn().mockReturnThis();
  const inMock = vi.fn().mockReturnValue(configQueryReturn);
  supabase.from.mockReturnValue({
    select: selectMock,
    in: inMock,
  });

  return {
    supabase,
    selectMock,
    inMock,
  };
};

// Reset all mocks after each test
export const resetAuthMocks = () => {
  vi.clearAllMocks();
};
