/**
 * Script simplifié de vérification des usages de createContext et des dépendances circulaires
 * 
 * Ce script analyse la base de code pour détecter les imports directs
 * de createContext et les dépendances circulaires potentielles.
 * 
 * Utilisation: node check-context-usage.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Répertoires à ignorer
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git'];

// Patterns à rechercher
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /import\s+\{\s*(?:[^}]*,\s*)?createContext(?:\s*,[^}]*)?\s*\}\s+from\s+['"]react['"]/g,
    replacement: `import { createContext } from '@/core/ReactInstance';`,
    description: "Import direct de createContext depuis 'react'"
  },
  {
    pattern: /const\s+(\w+)\s*=\s*React\.createContext\(/g,
    replacement: `const $1 = createContext(`,
    description: "Utilisation directe de React.createContext au lieu de createContext importé"
  },
  {
    pattern: /import\s+React\s+from\s+['"]react['"]/g,
    replacement: `import { React } from '@/core/ReactInstance';`,
    description: "Import direct de React depuis 'react'"
  },
  {
    pattern: /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/g,
    replacement: `import { React } from '@/core/ReactInstance';`,
    description: "Import direct de React depuis 'react' avec import *"
  }
];

// Patterns de dépendances circulaires connues
const CIRCULAR_DEPENDENCY_PATTERNS = [
  {
    files: ['sessionManager.ts', 'appState.ts'],
    description: "Dépendance circulaire entre sessionManager et appState"
  },
  {
    files: ['client.ts', 'profileUtils.ts'],
    description: "Dépendance circulaire entre client et profileUtils"
  }
];

// Compteurs pour le rapport
let filesChecked = 0;
let filesWithIssues = 0;
let issuesFound = 0;
let circularDepsFound = 0;

// Structure pour stocker les dépendances entre fichiers
const dependencies = new Map();

/**
 * Scan récursivement un répertoire pour trouver les fichiers TypeScript/JavaScript
 */
function scanDirectory(directory) {
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        if (!IGNORED_DIRS.includes(item.name)) {
          scanDirectory(fullPath);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
        checkFile(fullPath);
      }
    }
  } catch (err) {
    console.error(chalk.red(`Erreur lors de l'analyse du dossier ${directory}: ${err.message}`));
  }
}

/**
 * Vérifie un fichier pour trouver les patterns problématiques et les dépendances
 */
function checkFile(filePath) {
  try {
    filesChecked++;
    const content = fs.readFileSync(filePath, 'utf-8');
    let hasIssues = false;
    
    // Vérifier les patterns problématiques
    for (const { pattern, description, replacement } of PROBLEMATIC_PATTERNS) {
      pattern.lastIndex = 0; // Réinitialiser l'indice
      
      if (pattern.test(content)) {
        if (!hasIssues) {
          console.log(chalk.yellow(`\nProblèmes dans ${chalk.cyan(filePath)}:`));
          hasIssues = true;
          filesWithIssues++;
        }
        
        pattern.lastIndex = 0; // Réinitialiser pour compter
        const matches = content.match(pattern) || [];
        issuesFound += matches.length;
        
        console.log(`  ${chalk.red('✘')} ${description} (${matches.length} occurrence(s))`);
        console.log(`    Solution: ${chalk.green(replacement)}`);
      }
    }
    
    // Analyser les dépendances
    const fileName = path.basename(filePath);
    const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
    const deps = new Set();
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('.')) continue; // Ignorer les dépendances externes
      
      try {
        const basedir = path.dirname(filePath);
        let resolvedPath;
        
        if (importPath.startsWith('.')) {
          resolvedPath = path.resolve(basedir, importPath);
          // Ajuster pour rechercher les fichiers .ts/.tsx si aucune extension n'est spécifiée
          if (!path.extname(resolvedPath)) {
            for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
              const testPath = `${resolvedPath}${ext}`;
              if (fs.existsSync(testPath)) {
                resolvedPath = testPath;
                break;
              }
            }
          }
        }
        
        if (resolvedPath) {
          const depFileName = path.basename(resolvedPath);
          deps.add(depFileName);
        }
      } catch (e) {
        // Ignorer les erreurs de résolution de chemins
      }
    }
    
    dependencies.set(fileName, Array.from(deps));
    
  } catch (err) {
    console.error(chalk.red(`Erreur lors de la vérification de ${filePath}: ${err.message}`));
  }
}

/**
 * Détecte les dépendances circulaires dans l'application
 */
function detectCircularDependencies() {
  console.log(chalk.blue('\n=== Détection des dépendances circulaires ==='));
  
  // Vérifier les patterns connus
  for (const { files, description } of CIRCULAR_DEPENDENCY_PATTERNS) {
    let hasCircular = true;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nextFile = files[(i + 1) % files.length];
      
      const deps = dependencies.get(file) || [];
      if (!deps.includes(nextFile)) {
        hasCircular = false;
        break;
      }
    }
    
    if (hasCircular) {
      circularDepsFound++;
      console.log(chalk.red(`✘ ${description}: ${files.join(' → ')}`));
      console.log(chalk.yellow(`  Solution recommandée: Utiliser une interface partagée ou un fichier de types commun`));
    }
  }
  
  // Recherche générale de dépendances circulaires
  const visited = new Set();
  const recursionStack = new Set();
  
  function dfs(fileName, path = []) {
    if (recursionStack.has(fileName)) {
      const cycle = [...path.slice(path.indexOf(fileName)), fileName];
      console.log(chalk.red(`✘ Dépendance circulaire détectée: ${cycle.join(' → ')}`));
      circularDepsFound++;
      return;
    }
    
    if (visited.has(fileName)) return;
    
    visited.add(fileName);
    recursionStack.add(fileName);
    
    const deps = dependencies.get(fileName) || [];
    for (const dep of deps) {
      dfs(dep, [...path, fileName]);
    }
    
    recursionStack.delete(fileName);
  }
  
  for (const [fileName] of dependencies) {
    dfs(fileName);
  }
  
  if (circularDepsFound === 0) {
    console.log(chalk.green('✓ Aucune dépendance circulaire détectée dans les fichiers analysés.'));
  }
}

/**
 * Point d'entrée principal
 */
console.log(chalk.blue('=== Vérification des usages de createContext et des dépendances circulaires ==='));
console.log(chalk.blue('Ce script recherche les imports directs problématiques et les dépendances circulaires.'));
console.log();

// Lancer l'analyse du répertoire src
const rootDir = path.resolve(__dirname);
scanDirectory(path.join(rootDir, 'src'));

// Détecter les dépendances circulaires
detectCircularDependencies();

// Afficher le résumé
console.log();
console.log(chalk.blue('=== Résumé ==='));
console.log(`Fichiers analysés: ${filesChecked}`);
console.log(`Fichiers avec problèmes d'imports: ${filesWithIssues}`);
console.log(`Total des problèmes d'imports trouvés: ${issuesFound}`);
console.log(`Dépendances circulaires détectées: ${circularDepsFound}`);

if (issuesFound > 0 || circularDepsFound > 0) {
  console.log();
  console.log(chalk.yellow('Recommandations:'));
  
  if (issuesFound > 0) {
    console.log(`1. Utilisez ${chalk.green("import { createContext } from '@/core/ReactInstance';")} au lieu de l'import direct.`);
    console.log(`2. Utilisez ${chalk.green("import { React } from '@/core/ReactInstance';")} pour l'instance React complète.`);
  }
  
  if (circularDepsFound > 0) {
    console.log(`3. Pour les dépendances circulaires, créez des fichiers de types partagés.`);
    console.log(`4. Utilisez l'injection de dépendances pour éviter les imports directs entre modules interdépendants.`);
  }
  
  console.log();
  process.exit(1);
} else {
  console.log();
  console.log(chalk.green('✓ Aucun problème détecté. Votre code est propre et sans dépendances circulaires.'));
  console.log();
}
