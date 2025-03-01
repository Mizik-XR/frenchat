
/**
 * Module d'analyse de la compatibilité du navigateur pour l'IA locale
 */

export const checkBrowserCompatibility = (): { 
  compatible: boolean; 
  issues: string[]; 
  capabilities: Record<string, boolean>;
  shouldFallbackToCloud: boolean;
} => {
  const issues: string[] = [];
  const capabilities: Record<string, boolean> = {
    webWorkers: 'Worker' in window,
    webAssembly: typeof WebAssembly === 'object',
    sharedArrayBuffer: typeof SharedArrayBuffer === 'function',
    webGPU: 'gpu' in navigator,
    serviceWorkers: 'serviceWorker' in navigator,
    secureContext: window.isSecureContext
  };
  
  // Détection du navigateur et de sa version
  const userAgent = navigator.userAgent;
  const browserInfo = detectBrowser(userAgent);
  
  // Vérification du support WebAssembly (critique)
  if (!capabilities.webAssembly) {
    issues.push(`WebAssembly non supporté (requis pour l'IA locale)`);
  }
  
  // Vérification du support des Web Workers (critique)
  if (!capabilities.webWorkers) {
    issues.push(`Web Workers non supportés (requis pour l'IA locale)`);
  }
  
  // Vérification du support des SharedArrayBuffers (optionnel mais recommandé)
  if (!capabilities.sharedArrayBuffer) {
    issues.push(`SharedArrayBuffer non supporté (performance réduite)`);
  }
  
  // Vérification du support WebGPU (optionnel)
  if (!capabilities.webGPU) {
    // C'est optionnel, mais on l'ajoute comme limitation
    issues.push(`WebGPU non supporté (accélération GPU indisponible)`);
  }
  
  // Vérification du contexte sécurisé (nécessaire pour certaines API)
  if (!capabilities.secureContext) {
    issues.push(`Contexte non sécurisé (HTTPS requis pour certaines fonctionnalités)`);
  }
  
  // Vérifier si on devrait basculer vers le cloud automatiquement
  // Seulement si des fonctionnalités critiques manquent
  const shouldFallbackToCloud = !capabilities.webAssembly || !capabilities.webWorkers;
  
  return {
    // Compatibilité minimale: Web Workers + WebAssembly sont essentiels
    compatible: capabilities.webWorkers && capabilities.webAssembly,
    issues,
    capabilities,
    shouldFallbackToCloud
  };
};

/**
 * Détecte le navigateur et sa version à partir du User Agent
 */
const detectBrowser = (userAgent: string): { name: string; version: string; isSupported: boolean } => {
  // Extraction du navigateur et de la version
  let name = "Navigateur inconnu";
  let version = "Version inconnue";
  let isSupported = true;
  
  if (userAgent.includes("Chrome/")) {
    name = "Chrome";
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "?";
    isSupported = parseInt(version) >= 89;
  } 
  else if (userAgent.includes("Firefox/")) {
    name = "Firefox";
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "?";
    isSupported = parseInt(version) >= 90;
  }
  else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    name = "Safari";
    version = userAgent.match(/Version\/(\d+)/)?.[1] || "?";
    isSupported = parseInt(version) >= 15;
  }
  else if (userAgent.includes("Edg/")) {
    name = "Edge";
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || "?";
    isSupported = parseInt(version) >= 89;
  }
  
  return { name, version, isSupported };
};
