
import { User } from '@supabase/supabase-js';

// État global de l'authentification
let cachedUser: User | null = null;
let isSessionLoading = true;

// Routes protégées nécessitant une authentification
export const PROTECTED_ROUTES = ['/chat', '/config', '/documents', '/profile'];

// Types d'événements d'authentification
export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  INITIAL_SESSION: 'INITIAL_SESSION',
  MFA_CHALLENGE_VERIFIED: 'MFA_CHALLENGE_VERIFIED',
  SIGNED_UP: 'SIGNED_UP'
};

// Mises à jour de l'état d'authentification
export const updateCachedUser = (user: User | null) => {
  cachedUser = user;
};

export const getCachedUser = () => cachedUser;

export const updateSessionLoading = (loading: boolean) => {
  isSessionLoading = loading;
};

export const isAuthLoading = () => isSessionLoading;

export const needsConfiguration = (user: User | null) => {
  // Logique pour déterminer si l'utilisateur a besoin de compléter la configuration
  return false;
};

export const checkUserAndConfig = (user: User | null) => {
  return { user, needsConfig: needsConfiguration(user) };
};

export default {
  cachedUser,
  isSessionLoading,
  PROTECTED_ROUTES,
  AUTH_EVENTS,
  updateCachedUser,
  getCachedUser,
  updateSessionLoading,
  isAuthLoading,
  needsConfiguration,
  checkUserAndConfig
};
