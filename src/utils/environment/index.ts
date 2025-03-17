
/**
 * Point d'entrée pour les utilitaires d'environnement
 * Regroupe et exporte toutes les fonctions des différents modules
 */

// Exporter les fonctions de détection d'environnement
export {
  isProduction,
  isDevelopment,
  isLovableEnvironment,
  isCloudMode,
  isNetlifyEnvironment,
  isVercelEnvironment
} from './environmentDetection';

// Exporter les fonctions de gestion d'URL
export {
  getBaseUrl,
  getRedirectUrl,
  getFormattedUrlParams,
  getAllUrlParams,
  getNormalizedCloudModeUrl
} from './urlUtils';

// Exporter les fonctions de détection du mode cloud
export {
  getApiBaseUrl,
  isCloudModeInUrl,
  forceCloudMode,
  checkUrlAndSetCloudMode,
  initializeCloudMode
} from './cloudModeUtils';

// Réexporter les fonctions du environmentDetection pour la compatibilité
export { isCloudModeForced } from '../../hooks/ai/environment/environmentDetection';

// Fonctions utilitaires internes pour la gestion des modes
export const isClientMode = () => {
  return typeof window !== 'undefined' && 
         window.localStorage.getItem('CLIENT_MODE') === 'true';
};

export const isDebugMode = () => {
  return import.meta.env.DEV || 
         (typeof window !== 'undefined' && 
          window.localStorage.getItem('DEBUG_MODE') === 'true');
};
