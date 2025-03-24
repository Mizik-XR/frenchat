#!/usr/bin/env node

/**
 * Script de standardisation des imports React
 * 
 * Ce script analyse et corrige tous les imports React dans le projet :
 * 1. Remplace les imports directs depuis 'react' par des imports depuis '@/core/ReactInstance'
 * 2. Remplace les imports de hooks React par leurs équivalents dans ReactInstance
 * 3. Ajoute les imports React manquants aux fichiers qui utilisent React sans l'importer
 * 4. Consolide les imports multiples en un seul import
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const config = {
  rootDir: process.cwd(),
  srcDir: 'src',
  includePatterns: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  reactInstancePath: '@/core/ReactInstance',
};

// Types d'importations à rechercher et remplacer
const importPatterns = [
  {
    // Import React par défaut: import React from 'react'
    pattern: /import\s+React\s+from\s+['"]react['"]/g,
    replacement: `import { React } from '${config.reactInstancePath}'`
  },
  {
    // Import React avec namespace: import * as React from 'react'
    pattern: /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/g,
    replacement: `import { React } from '${config.reactInstancePath}'`
  },
  {
    // Import de hooks spécifiques: import { useState, useEffect } from 'react'
    pattern: /import\s+\{\s*((?:[a-zA-Z0-9_]+(?:\s*,\s*[a-zA-Z0-9_]+)*)*)\s*\}\s+from\s+['"]react['"]/g,
    replacer: (match, importList) => {
      const imports = importList.split(',').map(i => i.trim());
      return `import { ${imports.join(', ')} } from '${config.reactInstancePath}'`;
    }
  },
  {
    // Import de createContext: import { createContext } from 'react'
    pattern: /import\s+\{\s*(?:[^}]*,\s*)?createContext(?:\s*,[^}]*)?\s*\}\s+from\s+['"]react['"]/g,
    replacer: (match) => {
      // Extraire tous les imports entre accolades
      const importMatches = /\{\s*(.*?)\s*\}/.exec(match);
      if (!importMatches || !importMatches[1]) return match;
      
      const imports = importMatches[1].split(',').map(i => i.trim());
      return `import { ${imports.join(', ')} } from '${config.reactInstancePath}'`;
    }
  }
];

// Modèles pour détecter l'utilisation de React sans import
const reactUsagePatterns = [
  /<[A-Z][A-Za-z0-9]*/, // JSX avec composant personnalisé
  /<[a-z]+/, // JSX avec élément HTML
  /React\./, // Utilisation directe de React.
  /\sextends\s+React\.Component/, // Classe étendant React.Component
  /\simplements\s+React\./, // Interface implémentant React
  /: React\./, // Type annotation React
  /\(\s*props: React\./, // Fonction avec props React
  /\(\s*\{\s*[^}]+\s*\}:\s*React\./, // Destructuration avec type React
];

// Fonction pour vérifier si un fichier utilise React sans l'importer
function detectReactUsageWithoutImport(content) {
  // Vérifier si le fichier importe déjà React
  const hasReactImport = /import\s+\{\s*React\s*.*\}\s+from\s+['"@\/]core\/ReactInstance['"]/g.test(content);
  if (hasReactImport) return false;
  
  // Chercher des utilisations de React
  for (const pattern of reactUsagePatterns) {
    if (pattern.test(content)) return true;
  }
  
  return false;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const fullPath = path.join(config.rootDir, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Appliquer les patterns de remplacement
    for (const { pattern, replacement, replacer } of importPatterns) {
      if (pattern.test(content)) {
        if (replacer) {
          content = content.replace(pattern, replacer);
        } else {
          content = content.replace(pattern, replacement);
        }
        modified = true;
      }
    }
    
    // Vérifier si le fichier utilise React sans l'importer
    if (detectReactUsageWithoutImport(content)) {
      content = `import { React } from '${config.reactInstancePath}';\n${content}`;
      modified = true;
    }
    
    // Sauvegarder le fichier si modifié
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      return {
        path: filePath,
        status: 'modified'
      };
    }
    
    return {
      path: filePath,
      status: 'unchanged'
    };
  } catch (err) {
    return {
      path: filePath,
      status: 'error',
      error: err.message
    };
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue('🔍 Recherche des fichiers à traiter...'));
  
  // Construire les patterns de recherche globaux
  const patterns = config.includePatterns.map(pattern => 
    path.join(config.srcDir, pattern)
  );
  
  // Rechercher les fichiers
  const files = glob.sync(patterns, {
    ignore: config.excludePatterns,
    cwd: config.rootDir
  });
  
  console.log(chalk.blue(`📝 Traitement de ${files.length} fichiers...`));
  
  // Traiter les fichiers
  const results = files.map(processFile);
  
  // Analyser les résultats
  const modified = results.filter(r => r.status === 'modified');
  const unchanged = results.filter(r => r.status === 'unchanged');
  const errors = results.filter(r => r.status === 'error');
  
  // Afficher le rapport
  console.log(chalk.green(`\n✅ ${modified.length} fichiers mis à jour`));
  console.log(chalk.gray(`⏭️ ${unchanged.length} fichiers inchangés`));
  
  if (errors.length > 0) {
    console.log(chalk.red(`❌ ${errors.length} erreurs`));
    errors.forEach(e => console.log(chalk.red(`  - ${e.path}: ${e.error}`)));
  }
  
  // Liste des fichiers modifiés
  if (modified.length > 0) {
    console.log(chalk.blue('\nFichiers mis à jour:'));
    modified.forEach((file, index) => {
      if (index < 20) { // Limiter l'affichage à 20 fichiers
        console.log(chalk.green(`  - ${file.path}`));
      } else if (index === 20) {
        console.log(chalk.gray(`  ... et ${modified.length - 20} autres fichiers`));
      }
    });
  }
}

// Exécuter le script
main().catch(err => {
  console.error(chalk.red('Erreur lors de l\'exécution du script:'));
  console.error(err);
  process.exit(1);
}); 