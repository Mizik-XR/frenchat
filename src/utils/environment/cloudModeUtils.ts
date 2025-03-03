
/**
 * Utilitaires pour la détection et gestion du mode cloud
 */

import { getAllUrlParams } from './urlUtils';

/**
 * Détecte si le mode cloud est forcé via URL, environnement ou configuration
 * @returns true si le mode cloud est forcé
 */
export const isCloudModeForced = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Vérifier les paramètres d'URL (prioritaires)
  const urlParams = new URLSearchParams(window.location.search);
  const urlForceCloud = 
    urlParams.get('forceCloud') === 'true' || 
    urlParams.get('mode') === 'cloud';
  
  // Vérifier la configuration globale
  const configForceCloud = window.APP_CONFIG?.forceCloudMode === true;
  
  // Vérifier le localStorage
  const localStorageForceCloud = window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true';
  
  // Vérifier le .env.local ou variables d'environnement
  const envForceCloud = 
    import.meta.env.VITE_FORCE_CLOUD === 'true' || 
    import.meta.env.FORCE_CLOUD_MODE === 'true';
  
  // Si mode cloud détecté, persister dans localStorage
  if (urlForceCloud || configForceCloud || envForceCloud) {
    try {
      window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      window.localStorage.setItem('aiServiceType', 'cloud');
    } catch (e) {
      console.warn("Impossible de stocker les préférences de mode cloud dans localStorage");
    }
  }
  
  return urlForceCloud || configForceCloud || localStorageForceCloud || envForceCloud;
};

/**
 * Détermine si le mode client est activé
 */
export const isClientMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const params = getAllUrlParams();
  return params['client'] === 'true';
};

/**
 * Détermine si le mode debug est activé
 */
export const isDebugMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const params = getAllUrlParams();
  return params['debug'] === 'true' && params['hideDebug'] !== 'true';
};
