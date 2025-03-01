
/**
 * Module d'analyse de la compatibilité du navigateur pour l'IA locale
 */

export const checkBrowserCompatibility = (): { 
  compatible: boolean; 
  issues: string[]; 
  capabilities: Record<string, boolean>;
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
  
  // Vérification du support WebAssembly
  if (!capabilities.webAssembly) {
    issues.push("WebAssembly non supporté");
  }
  
  // Vérification du support des Web Workers
  if (!capabilities.webWorkers) {
    issues.push("Web Workers non supportés");
  }
  
  // Vérification du support des SharedArrayBuffers (nécessaire pour certaines opérations parallèles)
  if (!capabilities.sharedArrayBuffer) {
    issues.push("SharedArrayBuffer non supporté");
  }
  
  // Vérification du support WebGPU (optionnel mais recommandé pour les performances)
  if (!capabilities.webGPU) {
    // C'est optionnel, donc juste un avertissement
    console.log("WebGPU non supporté - l'accélération GPU ne sera pas disponible");
  }
  
  // Vérification du contexte sécurisé (exigé pour certaines API)
  if (!capabilities.secureContext) {
    issues.push("Contexte non sécurisé (HTTPS requis pour certaines fonctionnalités)");
  }
  
  return {
    compatible: issues.length === 0 || (issues.length === 1 && !capabilities.webGPU),
    issues,
    capabilities
  };
};
