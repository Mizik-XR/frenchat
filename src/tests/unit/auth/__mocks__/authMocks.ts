
import { supabase } from "@/integrations/supabase/client";
import { vi } from "vitest";
import { Session, User } from "@supabase/supabase-js";

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

// Setup function to configure mocks with specific returns
export const setupAuthMocks = ({
  getSessionReturn = { data: { session: null }, error: null },
  signOutReturn = { error: null },
  profileQueryReturn = { data: null, error: null },
  configQueryReturn = { data: [], error: null },
} = {}) => {
  // Important: utiliser vi.fn() pour créer de vrais mocks sur lesquels on peut appeler mockResolvedValue
  const getSessionMock = vi.fn().mockResolvedValue(getSessionReturn);
  const signOutMock = vi.fn().mockResolvedValue(signOutReturn);
  
  // Remplacer les fonctions dans supabase.auth
  supabase.auth.getSession = getSessionMock;
  supabase.auth.signOut = signOutMock;
  
  // Configurer le mock pour supabase.from avec une implémentation appropriée
  const selectMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const singleMock = vi.fn().mockResolvedValue(profileQueryReturn);
  
  const fromMock = vi.fn().mockImplementation((table) => {
    if (table === 'user_profiles') {
      return {
        select: selectMock,
        eq: eqMock,
        single: singleMock
      };
    } else if (table === 'service_configurations') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(configQueryReturn)
      };
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    };
  });
  
  supabase.from = fromMock;

  return {
    supabase,
    getSessionMock,
    signOutMock,
    selectMock,
    eqMock,
    singleMock
  };
};

// Reset all mocks
export const resetAuthMocks = () => {
  vi.resetAllMocks();
};
