
import { vi } from 'vitest';
import { createMockFunction, enhanceMockFunction } from './mockUtils';

// Mocks pour les fonctions Supabase
export const mockSignIn = enhanceMockFunction(createMockFunction());
export const mockSignUp = enhanceMockFunction(createMockFunction());
export const mockSignOut = enhanceMockFunction(createMockFunction());
export const mockGetUser = enhanceMockFunction(createMockFunction());
export const mockGetSession = enhanceMockFunction(createMockFunction());

// Mock pour le service Supabase
export const mockSupabaseAuth = {
  getUser: mockGetUser,
  getSession: mockGetSession,
  signInWithPassword: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
  onAuthStateChange: vi.fn()
};

export const mockSupabase = {
  auth: mockSupabaseAuth,
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data: null, error: null })))
  }))
};

// Réinitialiser tous les mocks
export const resetMocks = () => {
  vi.resetAllMocks();
  mockSignIn.mockReset();
  mockSignUp.mockReset();
  mockSignOut.mockReset();
  mockGetUser.mockReset();
  mockGetSession.mockReset();
  mockSupabaseAuth.onAuthStateChange.mockReset();
};

// Pour la compatibilité avec les tests existants
export const resetAuthMocks = resetMocks;

// Données de test
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z'
};

export const mockSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  user: mockUser,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 9999999999,
  provider_token: null,
  provider_refresh_token: null
};

// Helper pour configurer les mocks pour les tests
export const setupAuthMocks = (options = {}) => {
  const {
    signOutReturn = { error: null },
    signInReturn = { data: { session: mockSession, user: mockUser }, error: null },
    getUserReturn = { data: { user: mockUser }, error: null },
    getSessionReturn = { data: { session: mockSession }, error: null }
  } = options;

  mockSignOut.mockResolvedValue(signOutReturn);
  mockSignIn.mockResolvedValue(signInReturn);
  mockGetUser.mockResolvedValue(getUserReturn);
  mockGetSession.mockResolvedValue(getSessionReturn);
};

// Helper pour obtenir les mocks
export const getMockUser = () => mockUser;
export const getMockSession = () => mockSession;

// Réponses prédéfinies
export const mockSignedInResponse = {
  data: { session: mockSession, user: mockUser },
  error: null
};

export const mockSignedOutResponse = {
  data: { session: null, user: null },
  error: null
};

export const mockErrorResponse = {
  data: { session: null, user: null },
  error: { message: 'Authentication error', status: 401 }
};
