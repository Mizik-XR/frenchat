
/**
 * Utilitaires de détection d'environnement pour l'application
 */

// Détection de l'environnement Lovable
export function isLovableEnvironment(): boolean {
  // Vérifier si nous sommes en environnement Lovable
  if (typeof window === 'undefined') return false;
  
  // Vérifier l'URL
  const isLovableUrl = window.location.href.includes('lovable.dev') || 
                       window.location.href.includes('gpteng.co');
  
  // Vérifier la présence de l'objet global
  const hasGlobalObject = 'GPTEngineer' in window || '__GPTEngineer' in window;
  
  // Vérifier si le script est chargé
  const scriptLoaded = document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  return isLovableUrl || hasGlobalObject || scriptLoaded;
}

// Détection du mode cloud
export function isCloudMode(): boolean {
  // Si nous sommes dans Lovable, considérer comme mode cloud
  if (isLovableEnvironment()) {
    return true;
  }
  
  // Sinon, utiliser la fonction existante
  return import.meta.env.VITE_CLOUD_MODE === 'true' || 
         Boolean(import.meta.env.VITE_CLOUD_API_URL) ||
         Boolean(window.localStorage.getItem('CLOUD_MODE')) === true;
}

// Détection du mode développement local
export function isLocalDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

// Obtenir l'environnement actuel
export function getEnvironmentType(): 'local' | 'lovable' | 'production' {
  if (isLocalDevelopment()) {
    return 'local';
  }
  
  if (isLovableEnvironment()) {
    return 'lovable';
  }
  
  return 'production';
}
