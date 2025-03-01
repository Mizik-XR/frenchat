
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
  
  // Vérification du support WebAssembly (critique)
  if (!capabilities.webAssembly) {
    issues.push("WebAssembly non supporté");
  }
  
  // Vérification du support des Web Workers (critique)
  if (!capabilities.webWorkers) {
    issues.push("Web Workers non supportés");
  }
  
  // Vérification du support des SharedArrayBuffers (optionnel)
  if (!capabilities.sharedArrayBuffer) {
    // En production, nous n'allons pas le considérer comme critique
    // mais plutôt comme une limitation
    issues.push("SharedArrayBuffer non supporté");
  }
  
  // Vérification du support WebGPU (optionnel)
  if (!capabilities.webGPU) {
    // C'est optionnel, donc juste pour information
    console.log("WebGPU non supporté - l'accélération GPU ne sera pas disponible");
  }
  
  // Vérification du contexte sécurisé (nécessaire pour certaines API)
  if (!capabilities.secureContext) {
    issues.push("Contexte non sécurisé (HTTPS requis pour certaines fonctionnalités)");
  }
  
  // Vérifier si on devrait basculer vers le cloud automatiquement
  // Seulement si des fonctionnalités critiques manquent
  const shouldFallbackToCloud = !capabilities.webAssembly || !capabilities.webWorkers;
  
  return {
    // Compatibilité minimale: Web Workers + WebAssembly sont essentiels
    // Les autres fonctionnalités sont optionnelles ou peuvent fonctionner en mode dégradé
    compatible: capabilities.webWorkers && capabilities.webAssembly,
    issues,
    capabilities,
    shouldFallbackToCloud
  };
};
