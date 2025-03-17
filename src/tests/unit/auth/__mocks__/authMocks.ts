
// Importer createMockFunction pour créer des mocks compatibles
import { createMockFunction } from './mockUtils';

// Mocks pour les fonctions Supabase
export const mockSignIn = createMockFunction();
export const mockSignUp = createMockFunction();
export const mockSignOut = createMockFunction();
export const mockGetUser = createMockFunction();
export const mockGetSession = createMockFunction();

// Mock pour le service Supabase
export const mockSupabaseAuth = {
  getUser: mockGetUser,
  getSession: mockGetSession,
  signInWithPassword: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
  onAuthStateChange: jest.fn()
};

export const mockSupabase = {
  auth: mockSupabaseAuth,
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: null, error: null })))
  })
};

// Réinitialiser tous les mocks
export const resetMocks = () => {
  mockSignIn.mockReset();
  mockSignUp.mockReset();
  mockSignOut.mockReset();
  mockGetUser.mockReset();
  mockGetSession.mockReset();
  mockSupabaseAuth.onAuthStateChange.mockReset();
};

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
