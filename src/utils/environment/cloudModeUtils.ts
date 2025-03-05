
/**
 * Utilitaires pour la détection et la gestion du mode cloud
 */

/**
 * Vérifie si le mode cloud est forcé via les paramètres d'URL ou les variables d'environnement
 * @returns true si le mode cloud est forcé
 */
export function isCloudModeForced(): boolean {
  // Vérifier dans localStorage et dans les paramètres d'URL
  const forceCloud = 
    window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
    new URLSearchParams(window.location.search).get('forceCloud') === 'true';
  
  // Vérifier dans les variables d'environnement
  const envForceCloud = import.meta.env.VITE_FORCE_CLOUD_MODE === 'true';
  
  return forceCloud || envForceCloud;
}

/**
 * Vérifie si l'application est en mode client
 * @returns true si le mode client est activé
 */
export function isClientMode(): boolean {
  // Vérifier dans les paramètres d'URL
  return new URLSearchParams(window.location.search).get('client') === 'true';
}

/**
 * Vérifie si le mode debug est activé
 * @returns true si le mode debug est activé et non masqué
 */
export function isDebugMode(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const debug = urlParams.get('debug') === 'true';
  const hideDebug = urlParams.get('hideDebug') === 'true';
  
  return debug && !hideDebug;
}

/**
 * Définit le mode cloud dans le stockage local
 * @param enabled true pour activer le mode cloud, false pour le désactiver
 */
export function setCloudMode(enabled: boolean): void {
  if (enabled) {
    window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
  } else {
    window.localStorage.removeItem('FORCE_CLOUD_MODE');
  }
}

/**
 * Vérifie si l'application est en environnement Netlify
 * @returns true si l'application est hébergée sur Netlify
 */
export function isNetlifyEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env.NETLIFY === 'true' || 
         import.meta.env.VITE_ENVIRONMENT === 'production' ||
         window.location.hostname.includes('netlify.app');
}

/**
 * Détermine l'URL de base pour les appels API en fonction de l'environnement
 * @returns URL de base pour les appels API
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isNetlifyEnvironment()) {
    return '/.netlify/functions';
  }
  
  return 'http://localhost:8000';
}
