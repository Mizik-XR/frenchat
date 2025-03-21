
/**
 * Utilitaires de détection d'environnement
 * 
 * Ce fichier définit les fonctions primaires de détection d'environnement,
 * qui sont ensuite réexportées par index.ts pour maintenir la compatibilité des API.
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
