
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
  const shouldFallbackToCloud = !capabilities.webAssembly || !capabilities.webWorkers || !browserInfo.isSupported;
  
  // Si le navigateur est reconnu comme compatible, ne pas afficher les avertissements mineurs
  if (browserInfo.isSupported && capabilities.webAssembly && capabilities.webWorkers) {
    // Si c'est un navigateur supporté avec les fonctionnalités essentielles,
    // on retire les avertissements mineurs comme SharedArrayBuffer et WebGPU
    return {
      compatible: true,
      issues: [],
      capabilities,
      shouldFallbackToCloud: false
    };
  }
  
  return {
    // Compatibilité minimale: Web Workers + WebAssembly sont essentiels
    compatible: capabilities.webWorkers && capabilities.webAssembly && browserInfo.isSupported,
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
  
  // Amélioration de la détection de Chrome
  if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
    name = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
    if (match && match[1]) {
      version = match[1]; // Première partie de la version (ex: 89 dans 89.0.4389.82)
      isSupported = parseInt(version) >= 89;
    } else {
      // Si on ne peut pas extraire la version précise, on suppose que c'est une version récente
      isSupported = true;
    }
  } 
  else if (userAgent.indexOf("Firefox") !== -1) {
    name = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match?.[1] || "?";
    isSupported = parseInt(version) >= 90;
  }
  else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) {
    name = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    version = match?.[1] || "?";
    isSupported = parseInt(version) >= 15;
  }
  else if (userAgent.indexOf("Edg") !== -1) {
    name = "Edge";
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match?.[1] || "?";
    isSupported = parseInt(version) >= 89;
  }
  
  return { name, version, isSupported };
};
