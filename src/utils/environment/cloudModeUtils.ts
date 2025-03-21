
import { isLovableEnvironment } from './environmentDetection';

/**
 * Retourne l'URL de base de l'API en fonction de l'environnement
 * @returns URL de base de l'API
 */
export function getApiBaseUrl(): string {
  // Utiliser l'URL de l'API définie dans les variables d'environnement
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  
  if (configuredApiUrl) {
    return configuredApiUrl;
  }
  
  // En environnement de développement
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // En environnement Lovable, utiliser une API cloud
  if (isLovableEnvironment()) {
    return 'https://filechat-api.vercel.app/api';
  }
  
  // Fallback pour les autres environnements
  return '/api';
}

/**
 * Vérifie si le mode cloud est explicitement forcé par l'URL
 * @returns true si le mode cloud est forcé par l'URL
 */
export function isCloudModeInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('forceCloud') === 'true' || 
         urlParams.get('mode') === 'cloud';
}

/**
 * Force le mode cloud dans le localStorage
 */
export function forceCloudMode(): void {
  if (typeof window === 'undefined') return;
  
  window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
  window.localStorage.setItem('aiServiceType', 'cloud');
  
  // Log pour le débogage
  console.log('Mode cloud forcé via forceCloudMode()');
}

/**
 * Vérifie les paramètres d'URL et force le mode cloud si nécessaire
 */
export function checkUrlAndSetCloudMode(): void {
  if (typeof window === 'undefined') return;
  
  if (isCloudModeInUrl()) {
    forceCloudMode();
    console.log('Mode cloud forcé par les paramètres d\'URL');
  }
  
  // Vérifier également si nous sommes dans un environnement qui nécessite le mode cloud
  if (isLovableEnvironment()) {
    forceCloudMode();
    console.log('Mode cloud forcé par l\'environnement');
  }
}

/**
 * Initialise les paramètres de mode cloud au démarrage de l'application
 */
export function initializeCloudMode(): void {
  checkUrlAndSetCloudMode();
  
  // Ajouter un écouteur pour les changements d'URL
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', checkUrlAndSetCloudMode);
    
    // Vérifier explicitement le hostname
    if (window.location.hostname.includes('lovable') || 
        window.location.hostname.includes('preview')) {
      console.log('Environnement de prévisualisation détecté, activation du mode cloud');
      forceCloudMode();
    }
  }
}

// Exécution automatique au chargement du module
if (typeof window !== 'undefined') {
  initializeCloudMode();
}
