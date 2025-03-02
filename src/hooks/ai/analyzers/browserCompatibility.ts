
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
  
  // Déterminer si le navigateur est globalement compatible
  const compatible = issues.length === 0;
  
  // Déterminer si nous devrions basculer automatiquement vers le cloud
  // Si des problèmes critiques sont détectés
  const criticalIssues = issues.filter(issue => 
    issue.includes('WebAssembly') || issue.includes('Fetch')
  );
  const shouldFallbackToCloud = criticalIssues.length > 0;
  
  return {
    compatible,
    shouldFallbackToCloud,
    issues,
    capabilities
  };
}
