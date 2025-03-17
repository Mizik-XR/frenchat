
/**
 * Analyseur de dépendances pour FileChat
 * 
 * Ce script analyse la structure de dépendances du projet pour détecter:
 * - Les dépendances circulaires
 * - Les chemins d'importation problématiques
 * - Les composants avec trop de dépendances
 * 
 * Utilisation: node src/scripts/dependency-analyzer.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Map pour stocker le graphe de dépendances
const dependencyGraph = new Map();
// Set pour traquer les fichiers visités
const visitedFiles = new Set();
// Array pour stocker les dépendances circulaires détectées
const circularDependencies = [];
// Map pour stocker les statistiques d'import par fichier
const importStats = new Map();
// Problèmes détectés
const problems = [];

// Extensions à analyser
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
// Répertoires à ignorer
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git'];
// Import patterns à rechercher
const IMPORT_PATTERNS = [
  /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"]/g,
  /require\(['"]([^'"]+)['"]\)/g,
];

/**
 * Vérifie si un chemin est un fichier avec une extension valide
 */
function isValidFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return false;
    
    const ext = path.extname(filePath);
    return EXTENSIONS.includes(ext);
  } catch (err) {
    return false;
  }
}

/**
 * Résout un chemin d'importation relatif au fichier source
 */
function resolveImportPath(sourcePath, importPath) {
  if (importPath.startsWith('@/')) {
    // Alias @ pointe vers src/
    const rootDir = path.resolve(__dirname, '../..');
    return path.resolve(rootDir, 'src', importPath.substring(2));
  }
  
  if (importPath.startsWith('.')) {
    // Chemin relatif
    const sourceDir = path.dirname(sourcePath);
    return path.resolve(sourceDir, importPath);
  }
  
  // Import de node_modules, ignoré
  return null;
}

/**
 * Détermine le chemin complet du fichier à partir d'un import
 */
function resolveFullFilePath(basePath, importPath) {
  // Ignorer les imports de packages
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }
  
  // Résoudre le chemin de base de l'import
  const resolvedPath = resolveImportPath(basePath, importPath);
  if (!resolvedPath) return null;
  
  // Vérifier si le chemin existe directement
  if (isValidFile(resolvedPath)) {
    return resolvedPath;
  }
  
  // Essayer d'ajouter des extensions
  for (const ext of EXTENSIONS) {
    const pathWithExt = `${resolvedPath}${ext}`;
    if (isValidFile(pathWithExt)) {
      return pathWithExt;
    }
  }
  
  // Essayer avec index.ts/js
  for (const ext of EXTENSIONS) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (isValidFile(indexPath)) {
      return indexPath;
    }
  }
  
  // Impossible de résoudre
  return null;
}

/**
 * Extrait les imports d'un fichier
 */
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];
    
    for (const pattern of IMPORT_PATTERNS) {
      let match;
      pattern.lastIndex = 0; // Réinitialiser l'indice
      
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }
    
    return imports;
  } catch (err) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, err.message);
    return [];
  }
}

/**
 * Parcourt un dossier et analyse les fichiers
 */
function scanDirectory(directory) {
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (isValidFile(fullPath)) {
        analyzeDependencies(fullPath);
      }
    }
  } catch (err) {
    console.error(`Erreur lors de l'analyse du dossier ${directory}:`, err.message);
  }
}

/**
 * Analyse les dépendances d'un fichier
 */
function analyzeDependencies(filePath) {
  if (visitedFiles.has(filePath)) {
    return;
  }
  
  visitedFiles.add(filePath);
  const imports = extractImports(filePath);
  const resolvedImports = [];
  
  // Statistiques
  importStats.set(filePath, imports.length);
  
  for (const importPath of imports) {
    const resolvedPath = resolveFullFilePath(filePath, importPath);
    
    if (resolvedPath) {
      resolvedImports.push(resolvedPath);
      
      // Vérifier si cela crée une dépendance circulaire
      checkCircularDependency(filePath, resolvedPath, [filePath]);
      
      // Analyser récursivement la dépendance
      analyzeDependencies(resolvedPath);
    }
  }
  
  // Stocker les dépendances dans le graphe
  dependencyGraph.set(filePath, resolvedImports);
}

/**
 * Vérifie si un import crée une dépendance circulaire
 */
function checkCircularDependency(originalFile, currentFile, visited) {
  if (visited.includes(currentFile)) {
    // Dépendance circulaire détectée
    const cycle = [...visited.slice(visited.indexOf(currentFile)), currentFile];
    const cyclePath = cycle.map(f => path.relative(path.resolve(__dirname, '../..'), f)).join(' -> ');
    
    // Vérifier si cette circularité a déjà été détectée
    const alreadyDetected = circularDependencies.some(c => 
      c.files.join(',') === cycle.join(',')
    );
    
    if (!alreadyDetected) {
      circularDependencies.push({
        files: cycle,
        path: cyclePath
      });
      
      // Ajouter au problèmes
      problems.push({
        type: 'circular-dependency',
        severity: 'high',
        path: cyclePath,
        files: cycle,
        message: `Dépendance circulaire détectée: ${cyclePath}`,
        suggestion: generateSuggestionForCircular(cycle)
      });
    }
    
    return;
  }
  
  // Poursuivre la vérification récursive
  const dependencies = dependencyGraph.get(currentFile) || [];
  for (const dependency of dependencies) {
    checkCircularDependency(originalFile, dependency, [...visited, currentFile]);
  }
}

/**
 * Génère une suggestion pour résoudre une dépendance circulaire
 */
function generateSuggestionForCircular(cycle) {
  // Extraire les noms de fichiers simplifiés
  const fileNames = cycle.map(f => path.basename(f));
  
  // Déterminer quel type de fichiers est concerné
  const hasComponents = fileNames.some(f => f.includes('component') || f.endsWith('.tsx'));
  const hasHooks = fileNames.some(f => f.startsWith('use') || f.includes('hook'));
  const hasUtils = fileNames.some(f => f.includes('util') || f.includes('helper'));
  const hasContext = fileNames.some(f => f.includes('context') || f.includes('provider'));
  
  let suggestion = 'Pour résoudre cette dépendance circulaire:\n';
  
  if (hasContext && (hasComponents || hasHooks)) {
    suggestion += '- Extrayez les types partagés dans un fichier séparé "types.ts"\n';
    suggestion += '- Créez un fichier d\'initialisation du contexte qui ne dépend pas des composants consommateurs\n';
    suggestion += '- Utilisez React.lazy() pour charger dynamiquement les composants qui créent une circularité\n';
  } else if (hasHooks && hasComponents) {
    suggestion += '- Extrayez la logique partagée dans un service/utilitaire\n';
    suggestion += '- Séparez les hooks en deux: un pour la logique pure, un pour l\'intégration avec les composants\n';
    suggestion += '- Utilisez l\'injection de dépendances plutôt que des imports directs\n';
  } else if (hasUtils) {
    suggestion += '- Réorganisez vos utilitaires en modules plus petits et indépendants\n';
    suggestion += '- Créez une couche d\'abstraction pour éviter les dépendances directes\n';
  } else {
    suggestion += '- Extrayez le code partagé dans un module commun\n';
    suggestion += '- Utilisez l\'injection de dépendances ou un gestionnaire d\'événements\n';
    suggestion += '- Envisagez d\'utiliser des imports dynamiques (lazy loading)\n';
  }
  
  return suggestion;
}

/**
 * Analyse les problèmes d'importation @
 */
function analyzeAliasImports() {
  for (const [file, dependencies] of dependencyGraph.entries()) {
    const fileContent = fs.readFileSync(file, 'utf-8');
    
    // Vérifier les imports avec @
    const atImports = (fileContent.match(/import\s+(?:.+\s+from\s+)?['"]@[^'"]+['"]/g) || []);
    
    if (atImports.length > 0) {
      // Vérifier si l'import est résolu correctement
      const relPath = path.relative(path.resolve(__dirname, '../..'), file);
      
      for (const importStr of atImports) {
        const importPath = importStr.match(/['"](@[^'"]+)['"]/)[1];
        
        // Essayer de résoudre l'import
        const resolvedPath = resolveFullFilePath(file, importPath);
        
        if (!resolvedPath) {
          problems.push({
            type: 'unresolved-alias',
            severity: 'medium',
            path: relPath,
            message: `Import alias non résolu: ${importPath} dans ${relPath}`,
            suggestion: `Vérifiez le chemin d'import. Assurez-vous que le fichier existe et que l'alias @ est correctement configuré.`
          });
        }
      }
    }
  }
}

/**
 * Détecte les imports React problématiques
 */
function detectReactImportIssues() {
  for (const [file, _] of dependencyGraph.entries()) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(path.resolve(__dirname, '../..'), file);
      
      if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && 
          !content.includes('import React') && 
          !content.includes('* as React') &&
          (content.includes('React.') || content.includes('<React.'))) {
        
        problems.push({
          type: 'react-import-missing',
          severity: 'medium',
          path: relPath,
          message: `Utilisation de React sans l'importer dans ${relPath}`,
          suggestion: `Ajoutez 'import { React } from "@/core/ReactInstance";' en haut du fichier.`
        });
      }
      
      // Détecter les imports multiples de React
      const reactImports = (content.match(/import\s+(?:React|\{\s*.*\s*\})\s+from\s+['"]react['"]/g) || []);
      if (reactImports.length > 1) {
        problems.push({
          type: 'multiple-react-imports',
          severity: 'low',
          path: relPath,
          message: `Imports multiples de React dans ${relPath}`,
          suggestion: `Consolidez les imports React en un seul import.`
        });
      }
    } catch (err) {
      console.error(`Erreur lors de l'analyse des imports React dans ${file}:`, err.message);
    }
  }
}

/**
 * Identifie les composants avec un nombre excessif de dépendances
 */
function identifyComplexComponents() {
  for (const [file, dependencies] of dependencyGraph.entries()) {
    if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && dependencies.length > 15) {
      const relPath = path.relative(path.resolve(__dirname, '../..'), file);
      problems.push({
        type: 'complex-component',
        severity: 'medium',
        path: relPath,
        message: `Composant trop complexe avec ${dependencies.length} dépendances dans ${relPath}`,
        suggestion: `Décomposez ce composant en sous-composants plus petits et plus spécialisés. Utilisez React.lazy() pour charger dynamiquement certaines parties.`
      });
    }
  }
}

/**
 * Analyse spécifique pour détecter les problèmes de createContext
 */
function analyzeCreateContextIssues() {
  for (const [file, _] of dependencyGraph.entries()) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(path.resolve(__dirname, '../..'), file);
      
      // Détecter les createContext directs
      if (content.includes('createContext(') && !content.includes('safeCreateContext') && !content.includes('createContextSafely')) {
        problems.push({
          type: 'unsafe-context-creation',
          severity: 'high',
          path: relPath,
          message: `Utilisation directe de createContext dans ${relPath}`,
          suggestion: `Utilisez 'createContextSafely' de '@/utils/react/createContextSafely' ou 'safeCreateContext' de '@/utils/react/ReactBootstrap' pour assurer une instance React unique.`
        });
      }
      
      // Détecter l'import direct de createContext
      if (content.match(/import\s+\{\s*(?:[^}]*,\s*)?createContext(?:\s*,[^}]*)?\s*\}\s+from\s+['"]react['"]/)) {
        problems.push({
          type: 'direct-context-import',
          severity: 'high',
          path: relPath,
          message: `Import direct de createContext depuis 'react' dans ${relPath}`,
          suggestion: `Importez createContext depuis '@/core/ReactInstance' pour assurer une instance React unique.`
        });
      }
    } catch (err) {
      console.error(`Erreur lors de l'analyse des problèmes de createContext dans ${file}:`, err.message);
    }
  }
}

/**
 * Rapport principal
 */
function generateReport() {
  console.log('\n============================================');
  console.log('🔍 RAPPORT D\'ANALYSE DES DÉPENDANCES FILECHAT');
  console.log('============================================\n');
  
  console.log(`Fichiers analysés: ${visitedFiles.size}`);
  console.log(`Dépendances circulaires détectées: ${circularDependencies.length}`);
  console.log(`Problèmes totaux identifiés: ${problems.length}`);
  console.log('\n');
  
  // Afficher les dépendances circulaires
  if (circularDependencies.length > 0) {
    console.log('🔄 DÉPENDANCES CIRCULAIRES:');
    console.log('------------------------------------------');
    circularDependencies.forEach((circular, index) => {
      console.log(`${index + 1}. ${circular.path}`);
    });
    console.log('\n');
  }
  
  // Afficher les problèmes par sévérité
  const highSeverity = problems.filter(p => p.severity === 'high');
  const mediumSeverity = problems.filter(p => p.severity === 'medium');
  const lowSeverity = problems.filter(p => p.severity === 'low');
  
  if (highSeverity.length > 0) {
    console.log('🔴 PROBLÈMES CRITIQUES:');
    console.log('------------------------------------------');
    highSeverity.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.message}`);
      console.log(`   Suggestion: ${problem.suggestion}\n`);
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('🟠 PROBLÈMES MOYENS:');
    console.log('------------------------------------------');
    mediumSeverity.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.message}`);
      console.log(`   Suggestion: ${problem.suggestion}\n`);
    });
  }
  
  if (lowSeverity.length > 0) {
    console.log('🟡 PROBLÈMES MINEURS:');
    console.log('------------------------------------------');
    lowSeverity.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.message}`);
      console.log(`   Suggestion: ${problem.suggestion}\n`);
    });
  }
  
  // Fichiers les plus problématiques (avec le plus de dépendances)
  console.log('📊 TOP 10 FICHIERS AVEC LE PLUS DE DÉPENDANCES:');
  console.log('------------------------------------------');
  
  const sortedFiles = [...importStats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedFiles.forEach((entry, index) => {
    const relPath = path.relative(path.resolve(__dirname, '../..'), entry[0]);
    console.log(`${index + 1}. ${relPath} (${entry[1]} imports)`);
  });
  
  console.log('\n');
  console.log('============================================');
  console.log('Rapport généré le ' + new Date().toLocaleString());
  console.log('============================================');
}

/**
 * Génère des suggestions correctives pour améliorer la structure du projet
 */
function generateProjectImprovementSuggestions() {
  console.log('\n📝 SUGGESTIONS POUR AMÉLIORER LA STRUCTURE DU PROJET:');
  console.log('------------------------------------------\n');
  
  // Suggestion 1: Centralisation des exports
  console.log('1. CRÉER DES INDEX.TS POUR CENTRALISER LES EXPORTS:');
  console.log('   Regroupez les exports par dossier pour éviter les imports profonds.');
  console.log('   Exemple:');
  console.log('   ```');
  console.log('   // src/components/ui/index.ts');
  console.log('   export * from "./button";');
  console.log('   export * from "./card";');
  console.log('   // Puis importez comme: import { Button, Card } from "@/components/ui"');
  console.log('   ```\n');
  
  // Suggestion 2: Lazy loading
  console.log('2. IMPLÉMENTEZ LE LAZY LOADING:');
  console.log('   Chargez dynamiquement les composants lourds ou rarement utilisés.');
  console.log('   Exemple:');
  console.log('   ```');
  console.log('   // Au lieu d\'un import statique');
  console.log('   const HeavyComponent = React.lazy(() => import("./HeavyComponent"));');
  console.log('   // Puis utilisez avec <Suspense>');
  console.log('   ```\n');
  
  // Suggestion 3: Instance React unique
  console.log('3. ASSUREZ UNE INSTANCE REACT UNIQUE:');
  console.log('   Créez un fichier d\'instance React centrale pour résoudre les problèmes de versions multiples.');
  console.log('   Exemple:');
  console.log('   ```');
  console.log('   // src/core/ReactInstance.ts');
  console.log('   import * as React from "react";');
  console.log('   export { React };');
  console.log('   // Puis importez comme: import { React } from "@/core/ReactInstance"');
  console.log('   ```\n');
  
  // Suggestion 4: Services vs Hooks
  console.log('4. SÉPAREZ SERVICES ET HOOKS:');
  console.log('   Isolez la logique métier (services) des intégrations React (hooks).');
  console.log('   Exemple:');
  console.log('   ```');
  console.log('   // src/services/dataService.ts - logique pure');
  console.log('   export const fetchData = async () => { ... }');
  console.log('   ');
  console.log('   // src/hooks/useData.ts - intégration React');
  console.log('   import { fetchData } from "@/services/dataService";');
  console.log('   export const useData = () => { ... }');
  console.log('   ```\n');
  
  // Suggestion 5: Modèles de types
  console.log('5. EXTRAYEZ LES TYPES DANS DES FICHIERS SÉPARÉS:');
  console.log('   Pour éviter les dépendances circulaires liées aux types.');
  console.log('   Exemple:');
  console.log('   ```');
  console.log('   // src/types/user.ts');
  console.log('   export interface User { ... }');
  console.log('   ');
  console.log('   // Importez les types directement');
  console.log('   import type { User } from "@/types/user";');
  console.log('   ```\n');
}

/**
 * Analyse spécifique pour identifier les problèmes de production
 */
function analyzeProductionBuildIssues() {
  console.log('\n🔨 ANALYSE DES PROBLÈMES DE BUILD EN PRODUCTION:');
  console.log('------------------------------------------\n');
  
  // Compter les problèmes critiques qui affectent souvent les builds de production
  const reactInstanceIssues = problems.filter(p => 
    p.type === 'unsafe-context-creation' || 
    p.type === 'direct-context-import'
  );
  
  const circularIssues = problems.filter(p => p.type === 'circular-dependency');
  const complexComponentIssues = problems.filter(p => p.type === 'complex-component');
  
  // Rapport sur les problèmes qui peuvent affecter la production
  console.log('DIFFÉRENCES ENTRE LES BUILDS DE DÉVELOPPEMENT ET DE PRODUCTION:');
  console.log('1. Tree shaking plus agressif en production peut révéler des dépendances circulaires');
  console.log('2. La minification en production peut masquer les erreurs d\'instance React');
  console.log('3. Les optimisations de code peuvent causer des problèmes avec createContext');
  console.log('4. La division en chunks peut séparer des composants qui devraient partager une instance React');
  console.log('\n');
  
  console.log('PROBLÈMES SPÉCIFIQUES DÉTECTÉS:');
  console.log(`- ${reactInstanceIssues.length} problèmes liés à l'instance React et createContext`);
  console.log(`- ${circularIssues.length} dépendances circulaires qui peuvent causer des problèmes en production`);
  console.log(`- ${complexComponentIssues.length} composants trop complexes susceptibles de provoquer des erreurs d'optimisation`);
  console.log('\n');
  
  console.log('PLAN D\'ACTION POUR UN BUILD DE PRODUCTION STABLE:');
  console.log('1. Remplacer tous les appels directs à createContext par la version sécurisée');
  console.log('2. Résoudre les dépendances circulaires en commençant par les plus critiques');
  console.log('3. Diviser les composants complexes en sous-composants plus petits');
  console.log('4. Utiliser l\'instance React unique dans tous les fichiers qui utilisent React');
  console.log('5. Tester avec "npm run build -- --mode development" puis en mode production');
  console.log('\n');
}

/**
 * Exécute l'analyse complète
 */
function runAnalysis() {
  console.log('🚀 Démarrage de l\'analyse des dépendances...');
  const rootDir = path.resolve(__dirname, '../..');
  
  // Parcourir le dossier src
  scanDirectory(path.join(rootDir, 'src'));
  
  // Analyses supplémentaires
  console.log('✓ Graphe de dépendances construit. Analyse en cours...');
  analyzeAliasImports();
  detectReactImportIssues();
  identifyComplexComponents();
  analyzeCreateContextIssues();
  
  // Générer le rapport
  generateReport();
  generateProjectImprovementSuggestions();
  analyzeProductionBuildIssues();
}

// Exécuter l'analyse
runAnalysis();
