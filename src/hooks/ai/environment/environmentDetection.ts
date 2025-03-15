
import { isLovableEnvironment, isNetlifyEnvironment } from '@/utils/environment/environmentDetection';

/**
 * Détecte si le mode cloud est forcé
 * @returns true si le mode cloud est forcé
 */
export function isCloudModeForced(): boolean {
  // Dans un environnement de production Netlify, on préfère toujours utiliser les fonctions Netlify
  if (isNetlifyEnvironment() && import.meta.env.VITE_ALLOW_LOCAL_AI !== 'true') {
    return true;
  }
  
  return window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
    new URLSearchParams(window.location.search).get('forceCloud') === 'true' ||
    isLovableEnvironment();
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

/**
 * Vérifie si l'IA locale est autorisée dans l'environnement actuel
 * @returns true si l'IA locale est autorisée
 */
export function isLocalAIAllowed(): boolean {
  // Vérifier la variable d'environnement pour autoriser explicitement l'IA locale
  return import.meta.env.VITE_ALLOW_LOCAL_AI === 'true' || 
         !isNetlifyEnvironment(); // En local (hors Netlify), c'est toujours autorisé
}
