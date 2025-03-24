#!/usr/bin/env node
/**
 * Script pour vérifier les dépendances circulaires et les imports React
 * 
 * Ce script analyse le projet pour trouver les dépendances circulaires
 * et les imports directs de React (au lieu de ReactInstance).
 * 
 * Usage: node scripts/code-quality/check-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  srcDir: path.resolve(process.cwd(), 'src'),
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/tests/fixtures/**',
    '**/__mocks__/**',
  ],
  outputFile: path.resolve(process.cwd(), 'dependency-report.md'),
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Fonctions utilitaires
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function warn(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
  return false;
}

// Installer les dépendances nécessaires si elles ne sont pas déjà installées
function installDependencies() {
  try {
    info('Vérification des dépendances nécessaires...');
    
    // Essayer d'exécuter madge pour voir s'il est installé
    try {
      execSync('npx madge --version', { stdio: 'pipe' });
    } catch (e) {
      warn('madge n\'est pas installé. Installation en cours...');
      execSync('npm install --no-save madge glob', { stdio: 'inherit' });
    }
    
    success('Dépendances nécessaires installées avec succès.');
    return true;
  } catch (e) {
    error(`Échec de l'installation des dépendances: ${e.message}`);
    return false;
  }
}

// Trouver les dépendances circulaires
function findCircularDependencies() {
  info('Recherche des dépendances circulaires...');
  
  try {
    const result = execSync(`npx madge --circular --extensions js,jsx,ts,tsx ${CONFIG.srcDir}`, { stdio: 'pipe' }).toString();
    
    const circularDependencies = result.trim().split('\n').filter(line => line);
    
    if (circularDependencies.length === 0) {
      success('Aucune dépendance circulaire trouvée.');
      return [];
    }
    
    warn(`${circularDependencies.length} dépendances circulaires trouvées.`);
    circularDependencies.forEach(dep => {
      console.log(`  ${dep}`);
    });
    
    return circularDependencies;
  } catch (e) {
    error(`Échec de la recherche des dépendances circulaires: ${e.message}`);
    return [];
  }
}

// Analyser un fichier pour les imports React
function analyzeFileForReactImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Regex pour trouver les imports directs de React
    const reactImportRegex = /import\s+(?:React|{\s*(?:useState|useEffect|useContext|useRef|useMemo|useCallback|useReducer|useLayoutEffect|createContext)(?:\s*,\s*(?:useState|useEffect|useContext|useRef|useMemo|useCallback|useReducer|useLayoutEffect|createContext))*\s*})\s+from\s+['"]react['"]/g;
    
    const matches = content.match(reactImportRegex);
    
    if (matches) {
      return {
        path: filePath,
        imports: matches,
      };
    }
    
    return null;
  } catch (e) {
    error(`Échec de l'analyse du fichier ${filePath}: ${e.message}`);
    return null;
  }
}

// Trouver les imports directs de React
function findDirectReactImports() {
  info('Recherche des imports directs de React...');
  
  try {
    // Trouver tous les fichiers JS/TS
    const files = glob.sync(`${CONFIG.srcDir}/**/*.{js,jsx,ts,tsx}`, {
      ignore: CONFIG.ignorePatterns,
    });
    
    info(`${files.length} fichiers trouvés pour analyse.`);
    
    const directImports = [];
    
    for (const file of files) {
      const result = analyzeFileForReactImports(file);
      
      if (result) {
        directImports.push(result);
      }
    }
    
    if (directImports.length === 0) {
      success('Aucun import direct de React trouvé.');
    } else {
      warn(`${directImports.length} fichiers avec imports directs de React trouvés.`);
      
      // Afficher les 5 premiers fichiers
      directImports.slice(0, 5).forEach(({ path: filePath, imports }) => {
        console.log(`  ${filePath.replace(process.cwd(), '')}:`);
        imports.forEach(imp => {
          console.log(`    ${imp}`);
        });
      });
      
      if (directImports.length > 5) {
        console.log(`  ... et ${directImports.length - 5} fichiers de plus.`);
      }
    }
    
    return directImports;
  } catch (e) {
    error(`Échec de la recherche des imports directs de React: ${e.message}`);
    return [];
  }
}

// Générer un rapport
function generateReport(circularDependencies, directReactImports) {
  info('Génération du rapport...');
  
  try {
    let report = `# Rapport d'analyse des dépendances\n\n`;
    report += `*Généré le: ${new Date().toLocaleString()}*\n\n`;
    
    // Section des dépendances circulaires
    report += `## Dépendances circulaires\n\n`;
    
    if (circularDependencies.length === 0) {
      report += `✅ Aucune dépendance circulaire trouvée.\n\n`;
    } else {
      report += `⚠️ ${circularDependencies.length} dépendances circulaires trouvées:\n\n`;
      
      circularDependencies.forEach(dep => {
        report += `- ${dep}\n`;
      });
      
      report += `\n`;
      report += `### 🛠️ Suggestions de correction\n\n`;
      report += `Pour résoudre les dépendances circulaires, essayez les approches suivantes:\n\n`;
      report += `1. **Extraire les interfaces partagées**: Déplacer les interfaces ou types vers un fichier séparé pour briser les cycles.\n`;
      report += `2. **Utiliser l'inversion de dépendance**: Créer une abstraction qui peut être utilisée par les deux modules.\n`;
      report += `3. **Créer un service centralisé**: Déplacer la logique partagée vers un service centralisé.\n`;
      report += `4. **Restructurer les composants**: Diviser les composants pour éliminer les dépendances croisées.\n\n`;
    }
    
    // Section des imports directs de React
    report += `## Imports directs de React\n\n`;
    
    if (directReactImports.length === 0) {
      report += `✅ Aucun import direct de React trouvé.\n\n`;
    } else {
      report += `⚠️ ${directReactImports.length} fichiers avec imports directs de React trouvés:\n\n`;
      
      directReactImports.forEach(({ path: filePath, imports }) => {
        report += `### ${filePath.replace(process.cwd(), '')}\n\n`;
        report += `\`\`\`javascript\n`;
        imports.forEach(imp => {
          report += `${imp}\n`;
        });
        report += `\`\`\`\n\n`;
      });
      
      report += `### 🛠️ Correction requise\n\n`;
      report += `Pour corriger ces imports directs de React, vous devez les remplacer par des imports depuis le module ReactInstance:\n\n`;
      report += `\`\`\`javascript\n`;
      report += `// ❌ INCORRECT\n`;
      report += `import React, { useState, useEffect } from 'react';\n\n`;
      report += `// ✅ CORRECT\n`;
      report += `import { React, useState, useEffect } from '@/core/ReactInstance';\n`;
      report += `\`\`\`\n\n`;
      report += `Exécutez la commande suivante pour corriger automatiquement ces imports:\n\n`;
      report += `\`\`\`bash\n`;
      report += `npm run quality:fix-imports\n`;
      report += `\`\`\`\n\n`;
    }
    
    // Résumé
    report += `## Résumé\n\n`;
    report += `- **Dépendances circulaires**: ${circularDependencies.length === 0 ? '✅ Aucune' : `⚠️ ${circularDependencies.length}`}\n`;
    report += `- **Imports directs de React**: ${directReactImports.length === 0 ? '✅ Aucun' : `⚠️ ${directReactImports.length}`}\n\n`;
    
    if (circularDependencies.length === 0 && directReactImports.length === 0) {
      report += `### 🎉 Félicitations!\n\n`;
      report += `Votre code est propre et ne contient ni dépendances circulaires ni imports directs de React.\n`;
    } else {
      report += `### ⚠️ Actions requises\n\n`;
      report += `Veuillez résoudre les problèmes identifiés ci-dessus pour améliorer la qualité du code.\n`;
    }
    
    // Écrire le rapport
    fs.writeFileSync(CONFIG.outputFile, report);
    
    success(`Rapport généré avec succès: ${CONFIG.outputFile}`);
    return true;
  } catch (e) {
    error(`Échec de la génération du rapport: ${e.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  log('\n🔍 Vérification des dépendances', colors.cyan);
  log('============================\n');
  
  let exitCode = 0;
  
  try {
    if (!installDependencies()) {
      exitCode = 1;
      return;
    }
    
    const circularDependencies = findCircularDependencies();
    const directReactImports = findDirectReactImports();
    
    if (!generateReport(circularDependencies, directReactImports)) {
      exitCode = 1;
    }
    
    if (circularDependencies.length > 0 || directReactImports.length > 0) {
      warn('\nProblèmes détectés dans votre code. Consultez le rapport pour plus de détails.\n');
      exitCode = 1;
    } else {
      success('\nAucun problème détecté dans votre code! 🎉\n');
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 