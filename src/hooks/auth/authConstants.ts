
// Constantes liées à l'authentification
export const PROTECTED_ROUTES = ['/chat', '/config', '/documents', '/monitoring', '/ai-config', '/home'];

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
