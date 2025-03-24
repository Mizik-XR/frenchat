#!/usr/bin/env node
/**
 * Script pour corriger automatiquement les imports directs de React
 * 
 * Ce script recherche les imports directs de React et les remplace par
 * des imports depuis le module ReactInstance.
 * 
 * Usage: node scripts/code-quality/fix-react-imports.js
 */

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
    '**/ReactInstance.ts', // Ignorer le fichier ReactInstance lui-même
  ],
  backupDir: path.resolve(process.cwd(), '.backup'),
  dryRun: process.argv.includes('--dry-run'),
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
    
    // Vérifier si glob est installé
    try {
      require.resolve('glob');
    } catch (e) {
      warn('glob n\'est pas installé. Installation en cours...');
      const { execSync } = require('child_process');
      execSync('npm install --no-save glob', { stdio: 'inherit' });
    }
    
    success('Dépendances nécessaires installées avec succès.');
    return true;
  } catch (e) {
    error(`Échec de l'installation des dépendances: ${e.message}`);
    return false;
  }
}

// Créer un répertoire de sauvegarde
function createBackupDir() {
  try {
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    return true;
  } catch (e) {
    error(`Échec de la création du répertoire de sauvegarde: ${e.message}`);
    return false;
  }
}

// Sauvegarder un fichier avant de le modifier
function backupFile(filePath) {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(CONFIG.backupDir, relativePath);
    
    // Créer les répertoires nécessaires
    const backupDirPath = path.dirname(backupPath);
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    // Copier le fichier
    fs.copyFileSync(filePath, backupPath);
    return true;
  } catch (e) {
    error(`Échec de la sauvegarde du fichier ${filePath}: ${e.message}`);
    return false;
  }
}

// Corriger les imports React dans un fichier
function fixReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Regex pour trouver les différents types d'imports React
    const patterns = [
      // import React from 'react';
      {
        regex: /import\s+React\s+from\s+['"]react['"]\s*;/g,
        replacement: `import { React } from '@/core/ReactInstance';`,
      },
      // import React, { useState, useEffect } from 'react';
      {
        regex: /import\s+React,\s*{\s*([^}]+)\s*}\s+from\s+['"]react['"]\s*;/g,
        replacement: (match, p1) => `import { React, ${p1} } from '@/core/ReactInstance';`,
      },
      // import { useState, useEffect } from 'react';
      {
        regex: /import\s*{\s*([^}]+)\s*}\s+from\s+['"]react['"]\s*;/g,
        replacement: (match, p1) => `import { ${p1} } from '@/core/ReactInstance';`,
      },
      // import type { FC, ReactNode } from 'react';
      {
        regex: /import\s+type\s*{\s*([^}]+)\s*}\s+from\s+['"]react['"]\s*;/g,
        replacement: (match, p1) => `import { type ${p1.split(',').join(', type ')} } from '@/core/ReactInstance';`,
      },
    ];
    
    // Appliquer chaque pattern
    for (const { regex, replacement } of patterns) {
      content = content.replace(regex, replacement);
    }
    
    // Vérifier si le contenu a été modifié
    if (content !== originalContent) {
      // Si ce n'est pas un dry run, sauvegarder le fichier et écrire les modifications
      if (!CONFIG.dryRun) {
        backupFile(filePath);
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      return {
        path: filePath,
        modified: true,
      };
    }
    
    return {
      path: filePath,
      modified: false,
    };
  } catch (e) {
    error(`Échec de la correction des imports React dans ${filePath}: ${e.message}`);
    return {
      path: filePath,
      modified: false,
      error: e.message,
    };
  }
}

// Trouver et corriger les imports directs de React
function findAndFixReactImports() {
  info(`Recherche des fichiers JavaScript/TypeScript à analyser...`);
  
  try {
    // Trouver tous les fichiers JS/TS
    const files = glob.sync(`${CONFIG.srcDir}/**/*.{js,jsx,ts,tsx}`, {
      ignore: CONFIG.ignorePatterns,
    });
    
    info(`${files.length} fichiers trouvés pour analyse.`);
    
    let modifiedFiles = 0;
    let errorsCount = 0;
    
    files.forEach(file => {
      const result = fixReactImports(file);
      
      if (result.error) {
        errorsCount++;
      } else if (result.modified) {
        modifiedFiles++;
        if (CONFIG.dryRun) {
          info(`[DRY RUN] Le fichier serait modifié: ${file}`);
        } else {
          success(`Fichier modifié: ${file}`);
        }
      }
    });
    
    if (CONFIG.dryRun) {
      info(`[DRY RUN] ${modifiedFiles} fichiers seraient modifiés.`);
    } else {
      success(`${modifiedFiles} fichiers ont été modifiés avec succès.`);
    }
    
    if (errorsCount > 0) {
      warn(`${errorsCount} erreurs se sont produites lors du traitement des fichiers.`);
    }
    
    return {
      modifiedFiles,
      errorsCount,
    };
  } catch (e) {
    error(`Échec de la recherche et correction des imports React: ${e.message}`);
    return {
      modifiedFiles: 0,
      errorsCount: 1,
    };
  }
}

// Fonction principale
async function main() {
  log('\n🔧 Correction des imports React', colors.cyan);
  log('=============================\n');
  
  if (CONFIG.dryRun) {
    warn('Mode dry run activé. Aucune modification ne sera effectuée.\n');
  }
  
  let exitCode = 0;
  
  try {
    if (!installDependencies()) {
      exitCode = 1;
      return;
    }
    
    if (!CONFIG.dryRun && !createBackupDir()) {
      exitCode = 1;
      return;
    }
    
    const { modifiedFiles, errorsCount } = findAndFixReactImports();
    
    if (errorsCount > 0) {
      exitCode = 1;
    }
    
    if (modifiedFiles > 0) {
      if (CONFIG.dryRun) {
        info(`\n${modifiedFiles} fichiers ont besoin d'être corrigés. Exécutez ce script sans l'option --dry-run pour appliquer les corrections.`);
      } else {
        success(`\n${modifiedFiles} fichiers ont été corrigés avec succès. Une sauvegarde des fichiers originaux a été créée dans ${CONFIG.backupDir}.`);
      }
    } else {
      success('\nAucun fichier n\'a eu besoin d\'être corrigé. 🎉');
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 