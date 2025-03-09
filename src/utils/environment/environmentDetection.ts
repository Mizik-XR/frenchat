
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
 * Méthode améliorée avec vérification du domaine et des variables d'environnement
 */
export const isNetlifyEnvironment = (): boolean => {
  // Vérifier les variables d'environnement de Netlify (côté serveur)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NETLIFY === 'true' || process.env.NETLIFY_IMAGES_CDN_DOMAIN) {
      return true;
    }
  }
  
  // Vérifier si on est sur le domaine Netlify (côté client)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname.endsWith('.netlify.app') || 
      hostname.includes('-netlify-') ||
      window.location.href.includes('netlify')
    ) {
      return true;
    }
    
    // Vérifier l'objet de déploiement Netlify (peut être injecté par Netlify)
    // @ts-ignore - L'objet n'existe pas toujours
    if (window.netlifyIdentity || window.netlifyDeployContext) {
      return true;
    }
    
    // Vérifier le localStorage pour les indices de Netlify
    try {
      const netlifyContext = localStorage.getItem('netlifySiteURL') || 
                            localStorage.getItem('netlifyCmsPreviewContext');
      if (netlifyContext) {
        return true;
      }
    } catch (e) {
      // Ignorer les erreurs d'accès au localStorage
    }
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
 * Obtient des informations détaillées sur l'environnement de déploiement
 * Utile pour le débogage sur Netlify
 */
export const getEnvironmentInfo = (): Record<string, any> => {
  const envInfo: Record<string, any> = {
    environment: import.meta.env.MODE || 'unknown',
    production: isProduction(),
    development: isDevelopment(),
    netlify: isNetlifyEnvironment(),
    lovable: isLovableEnvironment(),
    timestamp: new Date().toISOString()
  };
  
  // Ajouter des informations spécifiques au navigateur si disponible
  if (typeof window !== 'undefined') {
    envInfo.userAgent = navigator.userAgent;
    envInfo.language = navigator.language;
    envInfo.online = navigator.onLine;
    envInfo.viewport = `${window.innerWidth}x${window.innerHeight}`;
    envInfo.devicePixelRatio = window.devicePixelRatio;
    envInfo.url = window.location.href;
    
    // Ajouter le contexte de déploiement Netlify si disponible
    // @ts-ignore - L'objet n'existe pas toujours
    if (window.netlifyDeployContext) {
      // @ts-ignore
      envInfo.netlifyContext = window.netlifyDeployContext;
    }
  }
  
  return envInfo;
};

// Déclaration de type pour ajouter la propriété gptengineer à l'objet Window
declare global {
  interface Window {
    gptengineer: any;
    netlifyIdentity?: any;
    netlifyDeployContext?: any;
    APP_CONFIG?: {
      forceCloudMode?: boolean;
      debugMode?: boolean;
    };
  }
}
