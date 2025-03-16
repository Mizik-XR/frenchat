
/**
 * Script de vérification des usages de createContext
 * 
 * Ce script analyse la base de code pour détecter les imports directs
 * de createContext qui pourraient causer des problèmes en production.
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
    replacement: `import { createContextSafely } from '@/utils/react/createContextSafely';`,
    description: "Import direct de createContext depuis 'react'"
  },
  {
    pattern: /const\s+(\w+)\s*=\s*createContext\(/g,
    replacement: `const $1 = createContextSafely(`,
    description: "Utilisation directe de createContext au lieu de createContextSafely"
  }
];

// Compteurs pour le rapport
let filesChecked = 0;
let filesWithIssues = 0;
let issuesFound = 0;

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
 * Vérifie un fichier pour trouver les patterns problématiques
 */
function checkFile(filePath) {
  try {
    filesChecked++;
    const content = fs.readFileSync(filePath, 'utf-8');
    let hasIssues = false;
    
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
  } catch (err) {
    console.error(chalk.red(`Erreur lors de la vérification de ${filePath}: ${err.message}`));
  }
}

/**
 * Point d'entrée principal
 */
console.log(chalk.blue('=== Vérification des usages de createContext ==='));
console.log(chalk.blue('Ce script recherche les imports directs de createContext qui peuvent causer des problèmes en production.'));
console.log();

// Lancer l'analyse du répertoire src
const rootDir = path.resolve(__dirname);
scanDirectory(path.join(rootDir, 'src'));

// Afficher le résumé
console.log();
console.log(chalk.blue('=== Résumé ==='));
console.log(`Fichiers analysés: ${filesChecked}`);
console.log(`Fichiers avec problèmes: ${filesWithIssues}`);
console.log(`Total des problèmes trouvés: ${issuesFound}`);

if (issuesFound > 0) {
  console.log();
  console.log(chalk.yellow('Recommandation:'));
  console.log(`Utilisez ${chalk.green("import { createContextSafely } from '@/utils/react/createContextSafely';")} au lieu de l'import direct.`);
  console.log(`Puis utilisez ${chalk.green('createContextSafely()')} au lieu de createContext().`);
  console.log();
  process.exit(1);
} else {
  console.log();
  console.log(chalk.green('✓ Aucun problème détecté. Votre code utilise createContext de manière sécurisée.'));
  console.log();
}
