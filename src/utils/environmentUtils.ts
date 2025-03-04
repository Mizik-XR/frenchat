
/**
 * Utilitaires pour la détection et la gestion de l'environnement d'exécution
 */

/**
 * Vérifie si l'application s'exécute dans un environnement de prévisualisation
 * (comme Lovable preview ou similaire)
 */
export const isPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname.includes('preview') || 
    hostname.includes('lovable') ||
    hostname.includes('localhost')
  );
};

/**
 * Vérifie si l'application s'exécute en environnement de développement
 */
export const isDevelopmentEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'development' || isPreviewEnvironment();
};

/**
 * Alias pour isDevelopmentEnvironment pour compatibilité avec le code existant
 */
export const isDevelopment = (): boolean => {
  return isDevelopmentEnvironment();
};

/**
 * Récupère l'URL de base de l'application en fonction de l'environnement
 */
export const getBaseUrl = (): string => {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL as string;
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (port) {
    return `${protocol}//${hostname}:${port}`;
  }
  
  return `${protocol}//${hostname}`;
};

/**
 * Récupère l'URL complète pour les redirections
 * @param path Le chemin relatif pour la redirection
 * @returns L'URL complète de redirection
 */
export const getRedirectUrl = (path: string): string => {
  return `${getBaseUrl()}/${path}`;
};

/**
 * Récupère l'URL de callback OAuth en fonction de l'environnement
 */
export const getOAuthCallbackUrl = (provider: string): string => {
  return getRedirectUrl(`auth/${provider}/callback`);
};

/**
 * Journalise les informations sur l'environnement actuel
 * Utile pour le débogage
 */
export const logEnvironmentInfo = (): void => {
  console.group('Informations sur l\'environnement');
  console.log('URL de base:', getBaseUrl());
  console.log('Est en prévisualisation:', isPreviewEnvironment());
  console.log('Est en développement:', isDevelopmentEnvironment());
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);
  console.groupEnd();
};

/**
 * Vérifie si le navigateur supporte toutes les fonctionnalités requises
 */
export const isBrowserCompatible = (): { compatible: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Vérifier le support pour les fonctionnalités essentielles
  if (!window.fetch) issues.push('Fetch API');
  if (!window.localStorage) issues.push('localStorage');
  if (!window.sessionStorage) issues.push('sessionStorage');
  if (!window.IntersectionObserver) issues.push('IntersectionObserver');
  
  return {
    compatible: issues.length === 0,
    issues
  };
};
