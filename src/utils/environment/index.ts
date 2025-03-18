
/**
 * Utilitaires de détection d'environnement
 */

/**
 * Vérifie si l'application est exécutée dans l'environnement Lovable
 */
export function isLovableEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname.includes('lovable') || 
         window.location.hostname.includes('lovableproject.com') ||
         window.location.hostname.includes('gpteng');
}

/**
 * Vérifie si l'application est exécutée en mode développement local
 */
export function isLocalDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

/**
 * Détecte si l'application est en cours d'exécution dans un environnement de prévisualisation
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname.includes('preview') || 
         isLovableEnvironment();
}

/**
 * Vérifie si l'application est exécutée en mode production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true && !isPreviewEnvironment();
}

/**
 * Vérifie si l'application est exécutée en mode développement
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true || !isProduction();
}

/**
 * Vérifie si le mode cloud est forcé dans l'application
 */
export function isCloudMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
         window.localStorage.getItem('aiServiceType') === 'cloud' ||
         new URLSearchParams(window.location.search).get('mode') === 'cloud' ||
         isLovableEnvironment();
}

/**
 * Récupère l'URL de base de l'application
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
  }
  
  // Utiliser l'URL actuelle si nous sommes dans un navigateur
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
}

/**
 * Construit une URL de redirection complète
 * @param path Chemin relatif à ajouter à l'URL de base
 */
export function getRedirectUrl(path: string): string {
  return `${getBaseUrl()}/${path.startsWith('/') ? path.substring(1) : path}`;
}

/**
 * Récupère tous les paramètres d'URL
 */
export function getAllUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Formate les paramètres d'URL en une chaîne
 */
export function getFormattedUrlParams(): string {
  if (typeof window === 'undefined') return '';
  
  const search = window.location.search;
  return search || '';
}

// Exporter les fonctions de urlUtils pour maintenir la compatibilité
export * from './urlUtils';
