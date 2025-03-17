
/**
 * Utilitaire pour analyser et détecter les dépendances circulaires
 * 
 * Cet outil permet d'identifier les chemins de dépendance problématiques
 * entre les modules. Utile pour comprendre les problèmes de construction.
 */

type DependencyPath = string[];
type DependencyMap = Map<string, string[]>;

/**
 * Détecte les dépendances circulaires dans l'arborescence de fichiers
 * @param rootPath Chemin racine à analyser
 * @returns Tableau de chemins circulaires détectés
 */
export function detectCircularDependencies(dependencyMap: DependencyMap): DependencyPath[] {
  const circularPaths: DependencyPath[] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  
  function dfs(module: string, path: string[] = []): void {
    if (stack.has(module)) {
      // Dépendance circulaire détectée
      const cycle = path.slice(path.indexOf(module));
      cycle.push(module);
      circularPaths.push(cycle);
      return;
    }
    
    if (visited.has(module)) {
      return;
    }
    
    visited.add(module);
    stack.add(module);
    path.push(module);
    
    const dependencies = dependencyMap.get(module) || [];
    for (const dependency of dependencies) {
      dfs(dependency, [...path]);
    }
    
    stack.delete(module);
  }
  
  // Explorer tous les modules
  for (const module of dependencyMap.keys()) {
    dfs(module);
  }
  
  return circularPaths;
}

/**
 * Analyse et suggère des solutions pour les dépendances circulaires
 * @param circularPaths Chemins circulaires détectés
 * @returns Suggestions pour résoudre les dépendances circulaires
 */
export function suggestCircularDependencySolutions(circularPaths: DependencyPath[]): string[] {
  const suggestions: string[] = [];
  
  for (const path of circularPaths) {
    const modules = path.join(' -> ');
    
    suggestions.push(`Dépendance circulaire détectée: ${modules}`);
    suggestions.push('Solutions possibles:');
    suggestions.push('1. Extraire les types communs dans un module séparé sans dépendances');
    suggestions.push('2. Utiliser des imports dynamiques (import()) pour briser le cycle');
    suggestions.push('3. Restructurer le code pour éliminer les dépendances circulaires');
    suggestions.push('4. Utiliser l\'injection de dépendances pour inverser le flux de contrôle');
    suggestions.push('---');
  }
  
  return suggestions;
}

/**
 * Rapport complet d'analyse des dépendances
 */
export function generateDependencyReport(dependencyMap: DependencyMap): string {
  const circularPaths = detectCircularDependencies(dependencyMap);
  const solutions = suggestCircularDependencySolutions(circularPaths);
  
  let report = '== RAPPORT D\'ANALYSE DES DÉPENDANCES ==\n\n';
  
  report += `Modules analysés: ${dependencyMap.size}\n`;
  report += `Dépendances circulaires détectées: ${circularPaths.length}\n\n`;
  
  if (circularPaths.length > 0) {
    report += '== DÉPENDANCES CIRCULAIRES ==\n\n';
    report += solutions.join('\n');
  } else {
    report += 'Aucune dépendance circulaire détectée.\n';
  }
  
  return report;
}
