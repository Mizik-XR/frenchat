
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
