
/**
 * Utilitaire pour détecter et vérifier l'environnement Lovable
 */

/**
 * Vérifie si l'application fonctionne dans l'environnement Lovable
 * @returns Boolean indiquant si l'application est dans l'environnement Lovable
 */
export function isLovableEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Vérifier si nous sommes dans un iframe (typique de Lovable)
  const isInIframe = window !== window.parent;
  
  // Vérifier si le script gptengineer.js est chargé
  const hasLovableScript = document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  // Vérifier si nous sommes sur un domaine Lovable
  const isLovableDomain = 
    window.location.hostname.includes('lovable.dev') || 
    window.location.hostname.includes('lovable.app') ||
    window.location.hostname.includes('lovableproject.com');
  
  return (isInIframe && hasLovableScript) || isLovableDomain;
}

/**
 * Vérifie si l'application a accès aux fonctionnalités Lovable
 * @returns Boolean indiquant si l'application peut accéder aux fonctionnalités Lovable
 */
export function canAccessLovableFeatures(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Vérifier si l'objet global gptengineer est disponible
  return typeof window.gptengineer !== 'undefined';
}

/**
 * Affiche des informations de diagnostic sur l'intégration Lovable
 */
export function logLovableDiagnostic(): void {
  console.group('Diagnostic Lovable');
  console.log(`Environnement Lovable: ${isLovableEnvironment()}`);
  console.log(`Fonctionnalités accessibles: ${canAccessLovableFeatures()}`);
  console.log(`Script présent: ${document.querySelector('script[src*="gptengineer.js"]') !== null}`);
  console.log(`URL actuelle: ${window.location.href}`);
  console.log(`Est dans iframe: ${window !== window.parent}`);
  console.log(`Mode: ${import.meta.env.MODE}`);
  console.groupEnd();
}

// Déclaration de type pour l'objet window
declare global {
  interface Window {
    gptengineer?: any;
  }
}

// Exécuter le diagnostic au chargement si en mode développement
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(logLovableDiagnostic, 1000);
  });
}
