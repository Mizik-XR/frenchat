
import { isLovableEnvironment, isNetlifyEnvironment, isCloudMode } from '@/utils/environment/environmentDetection';

/**
 * Détecte si le mode cloud est forcé
 * @returns true si le mode cloud est forcé
 */
export function isCloudModeForced(): boolean {
  // Dans un environnement Lovable, on préfère toujours utiliser le mode cloud
  if (isLovableEnvironment()) {
    console.log("Environnement Lovable détecté, mode cloud forcé");
    return true;
  }
  
  // Dans un environnement de production Netlify, on préfère toujours utiliser les fonctions Netlify
  if (isNetlifyEnvironment() && import.meta.env.VITE_ALLOW_LOCAL_AI !== 'true') {
    console.log("Environnement Netlify détecté, mode cloud forcé");
    return true;
  }
  
  // Vérifier la configuration explicite
  if (import.meta.env.VITE_CLOUD_MODE === 'true') {
    console.log("Mode cloud forcé par variable d'environnement VITE_CLOUD_MODE");
    return true;
  }
  
  // Vérifier les paramètres d'URL et le localStorage
  const forceCloud = window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ||
    new URLSearchParams(window.location.search).get('forceCloud') === 'true' ||
    isCloudMode();
  
  if (forceCloud) {
    console.log("Mode cloud forcé par paramètre URL ou localStorage");
  }
  
  return forceCloud;
}

/**
 * Gère les changements de mode de service
 * @param callback Fonction à appeler lorsque le mode change
 * @returns Fonction de nettoyage
 */
export function setupServiceModeListener(callback: () => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'FORCE_CLOUD_MODE' || 
        event.key === 'aiServiceType' || 
        event.key === 'CLIENT_MODE') {
      console.log(`Changement détecté pour ${event.key}, valeur: ${event.newValue}`);
      callback();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

/**
 * Vérifie si l'IA locale est autorisée dans l'environnement actuel
 * @returns true si l'IA locale est autorisée
 */
export function isLocalAIAllowed(): boolean {
  // Vérifier si nous sommes dans un environnement qui ne supporte pas l'IA locale
  if (isLovableEnvironment() || isCloudModeForced()) {
    console.log("IA locale non autorisée dans cet environnement");
    return false;
  }
  
  // Vérifier la variable d'environnement pour autoriser explicitement l'IA locale
  const allowLocalAI = import.meta.env.VITE_ALLOW_LOCAL_AI === 'true' || 
                       !isNetlifyEnvironment(); // En local (hors Netlify), c'est toujours autorisé
  
  console.log("IA locale " + (allowLocalAI ? "autorisée" : "non autorisée") + " dans cet environnement");
  return allowLocalAI;
}
