
/**
 * Utilities for environment detection
 */

/**
 * Detects if the application is running in a production environment
 * @returns true if the application is in production
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

/**
 * Detects if the application is running in a development environment
 * @returns true if the application is in development
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Detects if the application is running on Lovable
 */
export const isLovableEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in Lovable development mode
  if (typeof __LOVABLE_MODE__ !== 'undefined') {
    return true;
  }
  
  // Check hostname
  const isLovableDomain = 
    window.location.host.includes('lovable.dev') || 
    window.location.host.includes('lovable.app') ||
    window.location.host.includes('lovableproject.com');
  
  // Check if we're in an iframe
  const isInIframe = window !== window.parent;
  
  // Check if a Lovable parameter is present
  const hasLovableParam = 
    new URLSearchParams(window.location.search).get('lovable') === 'true' ||
    window.location.search.includes('forceHideBadge=true');
  
  // Check if the gptengineer.js script is loaded
  const isLovableScriptLoaded = 
    typeof window.gptengineer !== 'undefined' || 
    document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  return isLovableDomain || (isInIframe && hasLovableParam) || isLovableScriptLoaded;
};

/**
 * Detects if the application is running on Netlify
 * @returns true if the application is on Netlify
 */
export const isNetlifyEnvironment = (): boolean => {
  // Check for Netlify environment variables
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NETLIFY === 'true' || process.env.NETLIFY_SITE_ID) {
      return true;
    }
  }
  
  // Check for Netlify domain
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('netlify.app');
  }
  
  return false;
};

// Type declaration to add the gptengineer property to the Window object
declare global {
  interface Window {
    gptengineer: any;
    APP_CONFIG?: {
      forceCloudMode?: boolean;
      debugMode?: boolean;
    };
  }
  
  // Add __LOVABLE_MODE__ to global scope
  const __LOVABLE_MODE__: string | undefined;
}
