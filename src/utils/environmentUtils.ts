
/**
 * Vérifie si l'application s'exécute dans l'environnement Lovable
 * @returns true si l'environnement est celui de Lovable
 */
export function isLovableEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Vérification par URL
  const url = window.location.href;
  return url.includes('lovableproject.com') || 
         url.includes('gpt3.app') || 
         url.includes('lovable.ai');
}

/**
 * Vérifie si l'application s'exécute dans l'environnement Netlify
 * @returns true si l'environnement est celui de Netlify
 */
export function isNetlifyEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Vérification par variables d'environnement ou URLs Netlify
  const isNetlifyDomain = window.location.hostname.includes('netlify.app');
  const hasNetlifyContext = typeof process !== 'undefined' && 
                           process.env && 
                           (process.env.NETLIFY === 'true' || 
                            process.env.CONTEXT === 'production' || 
                            process.env.CONTEXT === 'deploy-preview');
  
  // Suppression de la référence à netlifyIdentity qui n'existe pas
  return isNetlifyDomain || hasNetlifyContext;
}

/**
 * Vérifie si l'environnement actuel est en développement
 * @returns true si l'environnement est celui de développement
 */
export function isDevEnvironment(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development' || 
           process.env.VITE_ENV === 'development';
  }
  return false;
}

/**
 * Configure l'environnement spécifique à Netlify
 */
export function setupNetlifyEnvironment(): void {
  if (isNetlifyEnvironment()) {
    // Configuration des variables d'env pour Netlify
    window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    
    // Configuration du comportement en cas d'erreur réseau
    window.addEventListener('error', (event) => {
      // Gérer uniquement les erreurs réseau
      if (event.message && event.message.includes('network') || 
          (event.error && event.error.message && event.error.message.includes('network'))) {
        console.warn('Erreur réseau détectée dans l\'environnement Netlify, redirection vers le mode fallback');
        // Rediriger vers mode de secours si besoin
        if (!window.location.href.includes('mode=fallback')) {
          window.location.href = '/?mode=fallback&client=true&forceCloud=true';
        }
      }
    });
  }
}

/**
 * Retourne les informations adaptées à l'environnement
 * @returns Informations spécifiques à l'environnement
 */
export function getEnvironmentInfo() {
  return {
    isLovable: isLovableEnvironment(),
    isNetlify: isNetlifyEnvironment(),
    isDev: isDevEnvironment(),
    browserInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    },
    screenInfo: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    }
  };
}

// Pour assurer la rétrocompatibilité, réexporter les fonctions du nouveau module
export { 
  getBaseUrl,
  getRedirectUrl, 
  getFormattedUrlParams,
  getAllUrlParams,
  getNormalizedCloudModeUrl
} from './utils/environment/urlUtils';
