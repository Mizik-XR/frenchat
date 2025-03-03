
/**
 * Utilitaires pour la gestion des environnements et des URLs
 */

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

/**
 * Détecte l'URL de base de l'application en fonction de l'environnement
 * @returns L'URL de base de l'application
 */
export const getBaseUrl = (): string => {
  // Vérifier si nous sommes dans un navigateur
  if (typeof window === 'undefined') {
    // Côté serveur, utiliser la variable d'environnement ou une valeur par défaut
    return process.env.VITE_SITE_URL || 'http://localhost:8080';
  }

  // Obtenir l'hôte actuel
  const currentHost = window.location.host;
  const isLocalhost = 
    currentHost.includes('localhost') || 
    currentHost.includes('127.0.0.1');
  const isLovablePreview = 
    currentHost.includes('lovable.dev') || 
    currentHost.includes('lovable.app') ||
    currentHost.includes('lovableproject.com');
  
  // Déterminer le protocole (http pour localhost, https pour les autres)
  const protocol = isLocalhost ? 'http' : 'https';
  
  return `${protocol}://${currentHost}`;
};

/**
 * Génère une URL de redirection pour l'authentification OAuth
 * @param path Le chemin de redirection (ex: "/auth/google/callback")
 * @returns L'URL complète de redirection
 */
export const getRedirectUrl = (path: string): string => {
  // Supprimer le slash initial si présent pour éviter les doubles slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${getBaseUrl()}/${cleanPath}`;
};

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
 * Détecte si le mode cloud est forcé via URL ou configuration
 * @returns true si le mode cloud est forcé
 */
export const isCloudModeForced = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Vérifier les paramètres d'URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlForceCloud = urlParams.get('forceCloud') === 'true' || urlParams.get('mode') === 'cloud';
  
  // Vérifier la configuration globale
  const configForceCloud = window.APP_CONFIG?.forceCloudMode === true;
  
  // Vérifier le localStorage
  const localStorageForceCloud = window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true';
  
  return urlForceCloud || configForceCloud || localStorageForceCloud;
};

/**
 * Détecte si l'application s'exécute sur Lovable
 * @returns true si l'application s'exécute sur Lovable
 */
export const isLovableEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Vérifier le hostname pour Lovable
  const isLovableDomain = window.location.host.includes('lovable.dev') || 
                         window.location.host.includes('lovable.app') ||
                         window.location.host.includes('lovableproject.com');
  
  // Vérifier si nous sommes dans un iframe (probable dans Lovable)
  const isInIframe = window !== window.parent;
  
  // Vérifier si nous sommes sur la plateforme Lovable avec un paramètre d'URL 
  const hasLovableParam = new URLSearchParams(window.location.search).get('lovable') === 'true' ||
                          window.location.search.includes('forceHideBadge=true');
  
  // Vérifier si le script gptengineer.js est chargé
  const isLovableScriptLoaded = typeof window.gptengineer !== 'undefined' || 
                               document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  return isLovableDomain || (isInIframe && hasLovableParam) || isLovableScriptLoaded;
};

/**
 * Vérifier si le script Lovable est correctement chargé
 * @returns true si le script est chargé
 */
export const isLovableScriptLoaded = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Vérifier si le script gptengineer.js est chargé
  return typeof window.gptengineer !== 'undefined' || 
         document.querySelector('script[src*="gptengineer.js"]') !== null;
};

/**
 * Retourne les paramètres d'URL formatés pour la navigation
 * @returns Chaîne de paramètres d'URL
 */
export const getFormattedUrlParams = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Paramètres d'URL à conserver lors des redirections
  const paramsToPersist = ['mode', 'client', 'debug'];
  const urlParams = new URLSearchParams(window.location.search);
  const persistedParams = new URLSearchParams();
  
  // Copier les paramètres à conserver
  for (const param of paramsToPersist) {
    if (urlParams.has(param)) {
      persistedParams.set(param, urlParams.get(param)!);
    }
  }
  
  // Si mode=cloud est présent, ajouter forceCloud=true
  if (urlParams.get('mode') === 'cloud') {
    persistedParams.set('forceCloud', 'true');
  }
  
  const paramString = persistedParams.toString();
  return paramString ? `?${paramString}` : '';
};
