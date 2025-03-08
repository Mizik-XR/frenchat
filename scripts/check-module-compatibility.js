
#!/usr/bin/env node

/**
 * Script de vérification de la compatibilité des modules pour Netlify
 * Vérifie les incompatibilités potentielles entre ESM et CommonJS
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const PATHS_TO_CHECK = [
  'netlify/functions',
  'supabase/functions',
  'src'
];

// Types de problèmes à rechercher
const ISSUE_TYPES = {
  REQUIRE_IN_ESM: 'require() dans un fichier ESM',
  IMPORT_IN_CJS: 'import dans un fichier CommonJS',
  MIXED_EXPORTS: 'exports mixtes (module.exports et export)',
  DYNAMIC_IMPORT_IN_CJS: 'import() dynamique dans un fichier CommonJS',
  INVALID_ESMODULE_EXTENSION: 'Extension de fichier incorrecte pour ESM'
};

// Extensions de fichiers à vérifier
const FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];

// Compteurs de problèmes
const issueCount = {
  total: 0,
  byType: {}
};

// Initialiser les compteurs par type
Object.keys(ISSUE_TYPES).forEach(type => {
  issueCount.byType[type] = 0;
});

// Fonction pour déterminer si un fichier utilise ESM
function isESMFile(filePath, content) {
  const ext = path.extname(filePath);
  
  // Fichiers .mjs sont toujours ESM
  if (ext === '.mjs') return true;
  
  // Fichiers .cjs sont toujours CommonJS
  if (ext === '.cjs') return false;
  
  // Vérifier le contenu pour les indicateurs ESM
  const hasESMSyntax = content.includes('import ') || 
                        content.includes('export ') || 
                        content.includes('export default ') ||
                        content.includes('export const ') ||
                        content.includes('export function ');
  
  // Vérifier package.json pour "type": "module" dans le dossier parent
  try {
    const dirPath = path.dirname(filePath);
    const packageJsonPath = path.join(dirPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.type === 'module') {
        return true;
      }
    }
  } catch (e) {
    // Ignorer les erreurs de lecture de package.json
  }
  
  return hasESMSyntax;
}

// Vérifier un fichier pour des problèmes de compatibilité
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isESM = isESMFile(filePath, content);
  const issues = [];
  
  // Vérifier les problèmes selon le type de module
  if (isESM) {
    // Problèmes dans les fichiers ESM
    if (content.includes('require(')) {
      issues.push(ISSUE_TYPES.REQUIRE_IN_ESM);
      issueCount.byType[ISSUE_TYPES.REQUIRE_IN_ESM]++;
    }
    
    // Extension incorrecte pour ESM
    const ext = path.extname(filePath);
    if (ext === '.js' && (content.includes('import ') || content.includes('export '))) {
      // Vérifier s'il y a un package.json avec "type": "module"
      let hasModuleTypePackageJson = false;
      try {
        const dirPath = path.dirname(filePath);
        const packageJsonPath = path.join(dirPath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          if (packageJson.type === 'module') {
            hasModuleTypePackageJson = true;
          }
        }
      } catch (e) {
        // Ignorer les erreurs
      }
      
      if (!hasModuleTypePackageJson) {
        issues.push(ISSUE_TYPES.INVALID_ESMODULE_EXTENSION);
        issueCount.byType[ISSUE_TYPES.INVALID_ESMODULE_EXTENSION]++;
      }
    }
  } else {
    // Problèmes dans les fichiers CommonJS
    if (content.includes('import ') && !content.includes('import(') && !content.includes('import type')) {
      issues.push(ISSUE_TYPES.IMPORT_IN_CJS);
      issueCount.byType[ISSUE_TYPES.IMPORT_IN_CJS]++;
    }
    
    // Détection d'exports mixtes
    if (content.includes('module.exports') && (content.includes('export ') || content.includes('export default'))) {
      issues.push(ISSUE_TYPES.MIXED_EXPORTS);
      issueCount.byType[ISSUE_TYPES.MIXED_EXPORTS]++;
    }
  }
  
  // Incrémenter le compteur total
  issueCount.total += issues.length;
  
  return {
    path: filePath,
    isESM,
    issues
  };
}

// Fonction récursive pour vérifier un répertoire
function checkDirectory(dirPath) {
  const results = [];
  
  // Lire le contenu du répertoire
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Parcourir les entrées
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorer node_modules et .git
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        results.push(...checkDirectory(fullPath));
      }
    } else if (entry.isFile()) {
      // Vérifier seulement les fichiers avec les extensions ciblées
      const ext = path.extname(entry.name);
      if (FILE_EXTENSIONS.includes(ext)) {
        const fileCheck = checkFile(fullPath);
        if (fileCheck.issues.length > 0) {
          results.push(fileCheck);
        }
      }
    }
  }
  
  return results;
}

// Fonction principale
function main() {
  console.log(chalk.blue.bold('=== Vérification de la compatibilité des modules pour Netlify ==='));
  console.log(chalk.blue(`Date: ${new Date().toISOString()}`));
  console.log(chalk.blue(`Répertoires analysés: ${PATHS_TO_CHECK.join(', ')}`));
  console.log('');
  
  let allResults = [];
  
  // Parcourir tous les chemins à vérifier
  for (const dirPath of PATHS_TO_CHECK) {
    if (fs.existsSync(dirPath)) {
      console.log(chalk.cyan(`Analyse du répertoire: ${dirPath}`));
      const results = checkDirectory(dirPath);
      allResults = [...allResults, ...results];
    } else {
      console.log(chalk.yellow(`Répertoire non trouvé: ${dirPath}`));
    }
  }
  
  // Afficher les résultats
  console.log('');
  console.log(chalk.blue.bold('=== Résultats de l\'analyse ==='));
  
  if (allResults.length === 0) {
    console.log(chalk.green('✓ Aucun problème de compatibilité détecté!'));
  } else {
    console.log(chalk.red(`× ${issueCount.total} problèmes détectés dans ${allResults.length} fichiers`));
    console.log('');
    
    // Afficher les statistiques par type de problème
    console.log(chalk.blue.bold('Types de problèmes:'));
    Object.keys(ISSUE_TYPES).forEach(typeKey => {
      const count = issueCount.byType[ISSUE_TYPES[typeKey]] || 0;
      if (count > 0) {
        console.log(chalk.yellow(`- ${ISSUE_TYPES[typeKey]}: ${count} occurrences`));
      }
    });
    
    console.log('');
    console.log(chalk.blue.bold('Détails des problèmes:'));
    
    // Trier les résultats par chemin de fichier
    allResults.sort((a, b) => a.path.localeCompare(b.path));
    
    // Afficher les détails pour chaque fichier problématique
    for (const result of allResults) {
      console.log(chalk.yellow(`\nFichier: ${result.path}`));
      console.log(`Type: ${result.isESM ? 'ESM' : 'CommonJS'}`);
      console.log('Problèmes:');
      
      for (const issue of result.issues) {
        console.log(chalk.red(`- ${issue}`));
      }
    }
    
    // Recommandations
    console.log('');
    console.log(chalk.blue.bold('=== Recommandations ==='));
    
    if (issueCount.byType[ISSUE_TYPES.REQUIRE_IN_ESM] > 0) {
      console.log(chalk.yellow('• Pour les fichiers ESM utilisant require():'));
      console.log('  - Remplacer require() par import');
      console.log('  - OU convertir le fichier en CommonJS (.cjs)');
      console.log('  - OU utiliser import() dynamique');
    }
    
    if (issueCount.byType[ISSUE_TYPES.IMPORT_IN_CJS] > 0) {
      console.log(chalk.yellow('• Pour les fichiers CommonJS utilisant import:'));
      console.log('  - Remplacer import par require()');
      console.log('  - OU convertir le fichier en ESM (.mjs ou package.json avec "type": "module")');
    }
    
    if (issueCount.byType[ISSUE_TYPES.MIXED_EXPORTS] > 0) {
      console.log(chalk.yellow('• Pour les fichiers avec exports mixtes:'));
      console.log('  - Standardiser sur module.exports (CommonJS) OU export (ESM)');
    }
    
    if (issueCount.byType[ISSUE_TYPES.INVALID_ESMODULE_EXTENSION] > 0) {
      console.log(chalk.yellow('• Pour les fichiers JS avec syntax ESM:'));
      console.log('  - Renommer en .mjs');
      console.log('  - OU ajouter "type": "module" dans package.json');
    }
  }
  
  // Message final
  console.log('');
  console.log(chalk.blue.bold('=== Fin de l\'analyse ==='));
  
  // Retourner un code d'erreur si des problèmes ont été détectés
  return issueCount.total > 0 ? 1 : 0;
}

// Exécuter la fonction principale
const exitCode = main();
process.exit(exitCode);
