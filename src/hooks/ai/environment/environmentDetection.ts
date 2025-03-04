
import { isLovableEnvironment, isNetlifyEnvironment } from '@/utils/environmentUtils';

/**
 * Détecte si le mode cloud est forcé
 * @returns true si le mode cloud est forcé
 */
export function isCloudModeForced(): boolean {
  return window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
    new URLSearchParams(window.location.search).get('forceCloud') === 'true' ||
    isLovableEnvironment() ||
    isNetlifyEnvironment();
}

/**
 * Gère les changements de mode de service
 * @param callback Fonction à appeler lorsque le mode change
 * @returns Fonction de nettoyage
 */
export function setupServiceModeListener(callback: () => void): () => void {
  const handleStorageChange = () => {
    callback();
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}
