
// Détection de l'environnement

/**
 * Vérifie si l'application est en mode production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || window.location.hostname !== 'localhost';
}

/**
 * Vérifie si l'application est en mode développement
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV && window.location.hostname === 'localhost';
}

/**
 * Vérifie si l'application est dans l'environnement Lovable
 */
export function isLovableEnvironment(): boolean {
  return window.location.hostname.includes('lovable.ai');
}

/**
 * Vérifie si l'application est dans l'environnement Netlify
 */
export function isNetlifyEnvironment(): boolean {
  return window.location.hostname.includes('netlify.app');
}

/**
 * Vérifie si l'application est en mode cloud forcé
 */
export function isCloudMode(): boolean {
  return localStorage.getItem('aiServiceType') === 'cloud' ||
         localStorage.getItem('FORCE_CLOUD_MODE') === 'true';
}

/**
 * Vérifie si l'IA locale est disponible
 */
export function isLocalAIAvailable(): boolean {
  return !isLovableEnvironment() && 
         !isCloudMode() && 
         localStorage.getItem('localAIUrl') !== null;
}

/**
 * Détecte le système d'exploitation de l'utilisateur
 */
export function detectOperatingSystem(): 'windows' | 'macos' | 'linux' | 'other' {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('windows') !== -1) return 'windows';
  if (userAgent.indexOf('mac') !== -1) return 'macos';
  if (userAgent.indexOf('linux') !== -1) return 'linux';
  
  return 'other';
}

/**
 * Détecte l'environnement de l'utilisateur
 */
export function detectUserEnvironment() {
  return {
    os: detectOperatingSystem(),
    browser: detectBrowser(),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isCloud: isCloudMode(),
    isLocalAIAvailable: isLocalAIAvailable()
  };
}

/**
 * Détecte le navigateur de l'utilisateur
 */
function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('chrome') !== -1 && userAgent.indexOf('edg') === -1) return 'chrome';
  if (userAgent.indexOf('firefox') !== -1) return 'firefox';
  if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) return 'safari';
  if (userAgent.indexOf('edg') !== -1) return 'edge';
  
  return 'other';
}
