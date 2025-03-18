
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
