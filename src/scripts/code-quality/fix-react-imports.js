#!/usr/bin/env node

/**
 * Script pour corriger les imports de React
 * 
 * Ce script parcourt tous les fichiers source et remplace les imports directs 
 * de React par des imports depuis notre module centralisé.
 * 
 * Usage: node scripts/code-quality/fix-react-imports.js
 * Options:
 *  --fix       Corriger automatiquement les erreurs (par défaut: afficher seulement)
 *  --verbose   Afficher plus de détails
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  srcDir: 'src',
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/reactInstance.ts', // Ignorer notre fichier centralisé
  ],
  dryRun: process.argv.indexOf('--fix') === -1, // Par défaut, n'effectue que des vérifications
  verbose: process.argv.indexOf('--verbose') !== -1,
  // Définir les patterns d'imports React à rechercher
  importPatterns: [
    { 
      regex: /import\s+React(?:,\s*{([^}]*)})?\s+from\s+['"]react['"]/g,
      replacement: (_, namedImports) => {
        if (!namedImports) {
          return `import React from '@/core/reactInstance'`;
        }
        return `import React, {${namedImports}} from '@/core/reactInstance'`;
      }
    },
    {
      regex: /import\s+{\s*([^}]*)\s*}\s+from\s+['"]react['"]/g,
      replacement: (_, namedImports) => `import { ${namedImports} } from '@/core/reactInstance'`
    }
  ],
};

// Utilitaires de journalisation
const logger = {
  info: (message) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  warn: (message) => console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  verbose: (message) => CONFIG.verbose && console.log(`\x1b[90m[DEBUG]\x1b[0m ${message}`),
};

// Vérifier si le répertoire 'core' existe, créer si nécessaire
function ensureCoreDirectoryExists() {
  const coreDir = path.join(process.cwd(), 'src', 'core');
  if (!fs.existsSync(coreDir)) {
    logger.info(`Création du répertoire core: ${coreDir}`);
    fs.mkdirSync(coreDir, { recursive: true });
    return false;
  }
  return true;
}

// Vérifier si le fichier reactInstance.ts existe déjà
function checkReactInstanceExists() {
  const reactInstancePath = path.join(process.cwd(), 'src', 'core', 'reactInstance.ts');
  return fs.existsSync(reactInstancePath);
}

// Trouver tous les fichiers à traiter
function findFiles() {
  const pattern = `${CONFIG.srcDir}/**/*.{js,jsx,ts,tsx}`;
  const allFiles = globSync(pattern, { ignore: CONFIG.ignorePatterns });
  logger.info(`Trouvé ${allFiles.length} fichiers à analyser`);
  return allFiles;
}

// Analyser un fichier pour trouver les imports React
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasDirectImports = false;
  let modifiedContent = content;

  for (const pattern of CONFIG.importPatterns) {
    if (pattern.regex.test(content)) {
      hasDirectImports = true;
      if (!CONFIG.dryRun) {
        // Réinitialiser le lastIndex pour les regex globales
        pattern.regex.lastIndex = 0;
        modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
      }
    }
    // Réinitialiser le lastIndex entre les fichiers
    pattern.regex.lastIndex = 0;
  }

  return {
    hasDirectImports,
    originalContent: content,
    modifiedContent,
  };
}

// Corriger un fichier en remplaçant les imports
function fixFile(filePath, modifiedContent) {
  fs.writeFileSync(filePath, modifiedContent, 'utf8');
  logger.success(`Corrigé: ${path.relative(process.cwd(), filePath)}`);
}

// Générer un rapport
function generateReport(results) {
  const totalFiles = results.length;
  const filesWithDirectImports = results.filter(r => r.hasDirectImports).length;
  
  logger.info('\n--- Rapport d\'analyse ---');
  logger.info(`Total des fichiers analysés: ${totalFiles}`);
  logger.info(`Fichiers avec imports React directs: ${filesWithDirectImports}`);
  
  if (CONFIG.dryRun) {
    logger.info('\nMode simulation (dry-run) activé. Aucun fichier n\'a été modifié.');
    logger.info('Utilisez --fix pour appliquer les corrections.');
  } else {
    logger.success(`\n${filesWithDirectImports} fichiers ont été corrigés.`);
  }
}

// Fonction principale
async function main() {
  try {
    logger.info('Démarrage de la vérification des imports React...');
    
    // Vérifier si le répertoire core existe
    ensureCoreDirectoryExists();
    
    // Vérifier si reactInstance.ts existe déjà
    const reactInstanceExists = checkReactInstanceExists();
    if (!reactInstanceExists) {
      logger.warn('Le fichier reactInstance.ts n\'existe pas encore.');
      logger.warn('Exécutez d\'abord la création du fichier src/core/reactInstance.ts');
      return;
    }

    // Trouver tous les fichiers
    const files = findFiles();
    
    // Analyser et corriger les fichiers
    const results = [];
    
    for (const file of files) {
      const result = analyzeFile(file);
      results.push({ file, ...result });
      
      if (result.hasDirectImports) {
        logger.verbose(`Import React direct trouvé dans: ${path.relative(process.cwd(), file)}`);
        
        if (!CONFIG.dryRun) {
          fixFile(file, result.modifiedContent);
        }
      }
    }
    
    // Générer et afficher le rapport
    generateReport(results);
    
  } catch (error) {
    logger.error(`Une erreur est survenue: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter le script
main(); 