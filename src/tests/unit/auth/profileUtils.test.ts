import { getUserProfileWithConfig } from '../../../hooks/auth/profileUtils';
import { mockSupabase } from './__mocks__/authMocks';
import { createMockFunction } from './__mocks__/mockUtils';

// Mock de fetchUserProfile
const mockFetchUserProfile = createMockFunction();

// Remplacer l'implémentation réelle par le mock
jest.mock('../../../hooks/auth/profileUtils', () => ({
  ...jest.requireActual('../../../hooks/auth/profileUtils'), // Conserver les autres fonctions non mockées
  fetchUserProfile: mockFetchUserProfile
}));

describe('profileUtils', () => {
  beforeEach(() => {
    // Réinitialiser le mock avant chaque test
    mockFetchUserProfile.mockReset();
  });

  test('returns profile data, needsConfig and isFirstLogin when successful', async () => {
    const mockProfile = { id: 'test-id', full_name: 'Test User' };
    const mockConfigs = [{ id: 'config-id', key: 'test-key', value: 'test-value' }];
    mockFetchUserProfile.mockResolvedValue({
      profile: mockProfile,
      configs: mockConfigs,
      needsConfig: false,
      isFirstLogin: false,
      error: null
    });

    const result = await getUserProfileWithConfig();

    expect(result.profile).toEqual(mockProfile);
    expect(result.isFirstLogin).toBeFalsy();
    expect(result.needsConfig).toBeFalsy();
    expect(result.error).toBeNull();
  });

  test('returns needsConfig true when no configs are found', async () => {
    const mockProfile = { id: 'test-id', full_name: 'Test User' };
    mockFetchUserProfile.mockResolvedValue({
      profile: mockProfile,
      configs: [],
      needsConfig: true,
      isFirstLogin: false,
      error: null
    });

    const result = await getUserProfileWithConfig();

    expect(result.profile).toEqual(mockProfile);
    expect(result.isFirstLogin).toBeFalsy();
    expect(result.needsConfig).toBeTruthy();
    expect(result.error).toBeNull();
  });

  test('handles error from fetchUserProfile', async () => {
    const mockError = { message: 'Test error' };
    mockFetchUserProfile.mockResolvedValue({
      profile: null,
      configs: [],
      needsConfig: true,
      isFirstLogin: false,
      error: mockError // Changement ici: profileError -> error
    });

    const result = await getUserProfileWithConfig();
    
    expect(result.profile).toBeNull();
    expect(result.isFirstLogin).toBeFalsy();
    expect(result.needsConfig).toBeTruthy();
    expect(result.error).toEqual(mockError); // Changement ici aussi
  });

  test('returns isFirstLogin true when no profile is found', async () => {
    mockFetchUserProfile.mockResolvedValue({
      profile: null,
      configs: [],
      needsConfig: true,
      isFirstLogin: true,
      error: null
    });

    const result = await getUserProfileWithConfig();

    expect(result.profile).toBeNull();
    expect(result.isFirstLogin).toBeTruthy();
    expect(result.needsConfig).toBeTruthy();
    expect(result.error).toBeNull();
  });
});
