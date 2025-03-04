
// Constantes liées à l'authentification
export const PROTECTED_ROUTES = [
  '/chat', 
  '/config', 
  '/documents', 
  '/monitoring', 
  '/ai-config', 
  '/home',
  '/system-status',
  '/profile'
];

// Constantes pour les routes d'authentification OAuth
export const OAUTH_ROUTES = {
  GOOGLE_CALLBACK: '/auth/google/callback',
  MICROSOFT_CALLBACK: '/auth/microsoft/callback',
  SUPABASE_CALLBACK: '/auth/callback'
};

// Messages d'erreur communs
export const AUTH_ERRORS = {
  SESSION_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
  INVALID_CREDENTIALS: 'Email ou mot de passe invalide',
  EMAIL_NOT_CONFIRMED: 'Veuillez confirmer votre adresse email',
  RATE_LIMITED: 'Trop de tentatives, veuillez réessayer plus tard',
  NETWORK_ERROR: 'Erreur réseau, vérifiez votre connexion internet',
  UNAUTHORIZED: 'Vous n\'avez pas l\'autorisation d\'accéder à cette ressource',
  FORBIDDEN: 'Accès refusé'
};

// État global pour optimiser les vérifications de session
export let cachedUser: any | null = null;
export let isSessionLoading = true;

// Mettre à jour le cache global de l'utilisateur
export const updateCachedUser = (user: any | null) => {
  cachedUser = user;
};

// Mettre à jour l'état de chargement global
export const updateSessionLoading = (loading: boolean) => {
  isSessionLoading = loading;
};

// Helper pour vérifier si une route est protégée
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

// Durée maximale d'une session en secondes (12 heures)
export const MAX_SESSION_DURATION = 12 * 60 * 60;

// Durée avant expiration pour le rafraîchissement de la session (30 minutes)
export const REFRESH_SESSION_BEFORE_EXPIRY = 30 * 60;
