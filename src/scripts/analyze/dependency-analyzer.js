
/**
 * Analyseur de dépendances pour détecter les dépendances circulaires
 * et d'autres problèmes structurels
 */

const path = require('path');
const chalk = require('chalk');

/**
 * Analyse les dépendances pour détecter les circularités
 * @param {Map} dependenciesMap - Map des dépendances par fichier
 * @returns {Array} Dépendances circulaires détectées
 */
function detectCircularDependencies(dependenciesMap) {
  const circularDeps = [];
  const visited = new Set();
  const recursionStack = new Set();
  
  function dfs(fileName, path = []) {
    if (recursionStack.has(fileName)) {
      const cycle = [...path.slice(path.indexOf(fileName)), fileName];
      circularDeps.push({
        files: cycle,
        path: cycle.join(' → ')
      });
      return;
    }
    
    if (visited.has(fileName)) return;
    
    visited.add(fileName);
    recursionStack.add(fileName);
    
    const deps = dependenciesMap.get(fileName) || [];
    for (const dep of deps) {
      if (dep.isRelative) {
        // Pour les dépendances relatives, résoudre le chemin
        // Simplification: on utilise juste le nom du fichier pour l'instant
        const depFileName = path.basename(dep.source);
        dfs(depFileName, [...path, fileName]);
      }
    }
    
    recursionStack.delete(fileName);
  }
  
  // Parcourir tous les fichiers
  for (const [fileName] of dependenciesMap) {
    dfs(fileName);
  }
  
  return circularDeps;
}

/**
 * Génère des suggestions pour résoudre les dépendances circulaires
 * @param {Array} circularDeps - Liste des dépendances circulaires
 * @returns {Array} Suggestions formatées
 */
function generateCircularDependencySuggestions(circularDeps) {
  return circularDeps.map(dep => {
    // Analyser les types de fichiers impliqués
    const fileNames = dep.files.map(f => path.basename(f));
    const hasComponents = fileNames.some(f => f.includes('component') || f.endsWith('.tsx'));
    const hasHooks = fileNames.some(f => f.startsWith('use') || f.includes('hook'));
    const hasUtils = fileNames.some(f => f.includes('util') || f.includes('helper'));
    const hasContext = fileNames.some(f => f.includes('context') || f.includes('provider'));
    
    let suggestion = 'Pour résoudre cette dépendance circulaire:\n';
    
    if (hasContext && (hasComponents || hasHooks)) {
      suggestion += '- Extrayez les types partagés dans un fichier séparé "types.ts"\n';
      suggestion += '- Créez un fichier d\'initialisation du contexte qui ne dépend pas des composants consommateurs\n';
    } else if (hasHooks && hasComponents) {
      suggestion += '- Extrayez la logique partagée dans un service/utilitaire\n';
      suggestion += '- Séparez les hooks en deux: un pour la logique pure, un pour l\'intégration avec les composants\n';
    } else if (hasUtils) {
      suggestion += '- Réorganisez vos utilitaires en modules plus petits et indépendants\n';
    } else {
      suggestion += '- Extrayez le code partagé dans un module commun\n';
      suggestion += '- Utilisez l\'injection de dépendances ou un gestionnaire d\'événements\n';
    }
    
    return {
      circularDep: dep,
      suggestion
    };
  });
}

module.exports = {
  detectCircularDependencies,
  generateCircularDependencySuggestions
};
