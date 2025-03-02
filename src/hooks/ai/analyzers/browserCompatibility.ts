
/**
 * Vérifie la compatibilité du navigateur pour l'exécution locale d'IA
 */
export function checkBrowserCompatibility(): {
  compatible: boolean;
  shouldFallbackToCloud: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Vérification de WebAssembly
  if (typeof WebAssembly !== 'object') {
    issues.push('WebAssembly n\'est pas supporté par ce navigateur');
  }
  
  // Vérification de SharedArrayBuffer (pour les workers parallèles)
  if (typeof SharedArrayBuffer !== 'function') {
    issues.push('SharedArrayBuffer n\'est pas supporté (nécessaire pour certains modèles)');
  }
  
  // Vérification des Workers
  if (typeof Worker !== 'function') {
    issues.push('Web Workers ne sont pas supportés');
  }
  
  // Vérification de l'API Fetch
  if (typeof fetch !== 'function') {
    issues.push('L\'API Fetch n\'est pas supportée');
  }
  
  // Vérification de IndexedDB (pour le stockage local)
  if (!window.indexedDB) {
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
    issues
  };
}
