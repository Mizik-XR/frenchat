
/**
 * Utilities for environment detection
 */

/**
 * Détecte si l'application s'exécute en environnement de production
 * @returns true si l'application est en production
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

/**
 * Détecte si l'application s'exécute en environnement de développement
 * @returns true si l'application est en développement
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Détecte si l'application s'exécute sur une plateforme Netlify
 */
export const isNetlifyEnvironment = (): boolean => {
  if (typeof process !== 'undefined') {
    return !!process.env.NETLIFY;
  }
  
  // Vérifier si on est sur le domaine Netlify
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('netlify.app');
  }
  
  return false;
};

/**
 * Détecte si l'application s'exécute sur Lovable
 */
export const isLovableEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Vérifier le hostname
  const isLovableDomain = 
    window.location.host.includes('lovable.dev') || 
    window.location.host.includes('lovable.app') ||
    window.location.host.includes('lovableproject.com');
  
  // Vérifier si nous sommes dans un iframe
  const isInIframe = window !== window.parent;
  
  // Vérifier si un paramètre Lovable est présent
  const hasLovableParam = 
    new URLSearchParams(window.location.search).get('lovable') === 'true' ||
    window.location.search.includes('forceHideBadge=true');
  
  // Vérifier si le script gptengineer.js est chargé
  const isLovableScriptLoaded = 
    typeof window.gptengineer !== 'undefined' || 
    document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  return isLovableDomain || (isInIframe && hasLovableParam) || isLovableScriptLoaded;
};

/**
 * Détecte si l'application fonctionne en mode cloud
 */
export const isCloudMode = (): boolean => {
  // Vérifier d'abord si le mode cloud est explicitement forcé par la variable d'environnement
  if (import.meta.env.VITE_CLOUD_MODE === 'true') {
    return true;
  }
  
  // Vérifier si nous sommes dans un environnement de prévisualisation Lovable
  if (isLovableEnvironment()) {
    return true;
  }
  
  // Vérifier si le mode cloud est forcé par un paramètre d'URL
  if (typeof window !== 'undefined') {
    const forceCloud = new URLSearchParams(window.location.search).get('forceCloud') === 'true';
    if (forceCloud) {
      return true;
    }
  }
  
  // Par défaut, utiliser le stockage local
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true';
  }
  
  return false;
};

// Déclaration de type pour ajouter la propriété gptengineer à l'objet Window
declare global {
  interface Window {
    gptengineer: any;
    APP_CONFIG?: {
      forceCloudMode?: boolean;
      debugMode?: boolean;
    };
  }
}
