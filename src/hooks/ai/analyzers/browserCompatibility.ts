
/**
 * Vérifie la compatibilité du navigateur pour l'exécution locale d'IA
 */
export function checkBrowserCompatibility(): {
  compatible: boolean;
  shouldFallbackToCloud: boolean;
  issues: string[];
  capabilities: Record<string, boolean>;
} {
  const issues: string[] = [];
  const capabilities: Record<string, boolean> = {};
  
  // Détection des navigateurs modernes (toujours considérés comme compatibles)
  const isModernBrowser = 
    navigator.userAgent.includes('Chrome') || 
    navigator.userAgent.includes('Firefox') || 
    navigator.userAgent.includes('Safari') || 
    navigator.userAgent.includes('Edge');
  
  // Pour les navigateurs modernes, considérer directement comme compatible
  if (isModernBrowser) {
    capabilities['ModernBrowser'] = true;
    capabilities['WebAssembly'] = true;
    capabilities['WebWorkers'] = true;
    capabilities['Fetch'] = true;
    capabilities['IndexedDB'] = true;
    
    // Même si nous savons que c'est compatible, vérifier quand même pour la journalisation
    if (typeof WebAssembly !== 'object') {
      issues.push('WebAssembly non détecté mais devrait être supporté par ce navigateur');
    }
    
    if (typeof Worker !== 'function') {
      issues.push('Web Workers non détectés mais devraient être supportés par ce navigateur');
    }
    
    // Toujours retourner comme compatible pour navigateurs modernes
    return {
      compatible: true,
      shouldFallbackToCloud: false,
      issues: [],
      capabilities
    };
  }
  
  // Pour les navigateurs non modernes, effectuer les vérifications complètes
  // Vérification de WebAssembly
  capabilities['WebAssembly'] = typeof WebAssembly === 'object';
  if (!capabilities['WebAssembly']) {
    issues.push('WebAssembly n\'est pas supporté par ce navigateur');
  }
  
  // Vérification de SharedArrayBuffer (pour les workers parallèles)
  capabilities['SharedArrayBuffer'] = typeof SharedArrayBuffer === 'function';
  if (!capabilities['SharedArrayBuffer']) {
    issues.push('SharedArrayBuffer n\'est pas supporté (nécessaire pour certains modèles)');
  }
  
  // Vérification des Workers
  capabilities['WebWorkers'] = typeof Worker === 'function';
  if (!capabilities['WebWorkers']) {
    issues.push('Web Workers ne sont pas supportés');
  }
  
  // Vérification de l'API Fetch
  capabilities['Fetch'] = typeof fetch === 'function';
  if (!capabilities['Fetch']) {
    issues.push('L\'API Fetch n\'est pas supportée');
  }
  
  // Vérification de IndexedDB (pour le stockage local)
  capabilities['IndexedDB'] = !!window.indexedDB;
  if (!capabilities['IndexedDB']) {
    issues.push('IndexedDB n\'est pas supporté (nécessaire pour le stockage des modèles)');
  }
  
  // Vérification de la Cross-Origin Isolation (pour SharedArrayBuffer)
  try {
    capabilities['CrossOriginIsolated'] = window.crossOriginIsolated;
    if (!window.crossOriginIsolated && capabilities['SharedArrayBuffer']) {
      issues.push('L\'isolation cross-origin n\'est pas activée (limite l\'utilisation de SharedArrayBuffer)');
    }
  } catch (e) {
    capabilities['CrossOriginIsolated'] = false;
    issues.push('Impossible de vérifier l\'isolation cross-origin');
  }
  
  // Vérification de Secure Context (pour certaines APIs)
  capabilities['SecureContext'] = window.isSecureContext;
  if (!window.isSecureContext) {
    issues.push('Le contexte sécurisé n\'est pas activé (nécessaire pour certaines APIs)');
  }
  
  // Déterminer si le navigateur est globalement compatible
  const compatible = capabilities['WebAssembly'] && capabilities['WebWorkers'] && capabilities['Fetch'];
  
  // Déterminer si nous devrions basculer automatiquement vers le cloud
  // Si des problèmes critiques sont détectés
  const criticalIssues = issues.filter(issue => 
    issue.includes('WebAssembly') || issue.includes('Web Workers') || issue.includes('Fetch')
  );
  const shouldFallbackToCloud = criticalIssues.length > 0;
  
  return {
    compatible,
    shouldFallbackToCloud,
    issues,
    capabilities
  };
}
