
/**
 * Scanner de fichiers pour l'analyse du projet
 * Gère le parcours récursif des répertoires et la recherche de fichiers
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { analyzeWithAST } = require('./ast-analyzer');

// Répertoires à ignorer
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];

// Extensions à analyser
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Vérifie si un fichier doit être analysé en fonction de son extension
 * @param {string} filePath - Chemin du fichier
 * @returns {boolean} true si le fichier doit être analysé
 */
function shouldAnalyzeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSIONS.includes(ext);
}

/**
 * Scanne récursivement un répertoire et analyse les fichiers correspondants
 * @param {string} directory - Répertoire à scanner
 * @param {Object} options - Options de scan
 * @returns {Object} Résultats du scan
 */
function scanDirectory(directory, options = {}) {
  const results = {
    filesScanned: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    issues: [],
    dependencies: new Map()
  };

  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        // Ignorer les répertoires configurés
        if (!IGNORED_DIRS.includes(item.name)) {
          // Analyse récursive et fusion des résultats
          const subResults = scanDirectory(fullPath, options);
          
          results.filesScanned += subResults.filesScanned;
          results.filesWithIssues += subResults.filesWithIssues;
          results.totalIssues += subResults.totalIssues;
          results.issues = [...results.issues, ...subResults.issues];
          
          // Fusionner les maps de dépendances
          for (const [key, value] of subResults.dependencies) {
            results.dependencies.set(key, value);
          }
        }
      } else if (shouldAnalyzeFile(fullPath)) {
        // Analyser le fichier individuel
        const fileResults = analyzeFile(fullPath, options);
        
        results.filesScanned++;
        
        if (fileResults.issues.length > 0) {
          results.filesWithIssues++;
          results.totalIssues += fileResults.issues.length;
          results.issues = [...results.issues, ...fileResults.issues];
        }
        
        // Ajouter les dépendances du fichier
        if (fileResults.dependencies) {
          results.dependencies.set(path.basename(fullPath), fileResults.dependencies);
        }
      }
    }
  } catch (err) {
    console.error(chalk.red(`Erreur lors de l'analyse du dossier ${directory}: ${err.message}`));
  }
  
  return results;
}

/**
 * Analyse un fichier individuel
 * @param {string} filePath - Chemin du fichier à analyser
 * @param {Object} options - Options d'analyse
 * @returns {Object} Résultats de l'analyse
 */
function analyzeFile(filePath, options = {}) {
  const results = {
    issues: [],
    dependencies: []
  };
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Analyser avec l'AST
    const astResults = analyzeWithAST(filePath, content);
    
    // Transformer les problèmes en issues pour le rapport
    if (astResults.problems && astResults.problems.length > 0) {
      results.issues = astResults.problems.map(problem => ({
        filePath,
        ...problem,
        relativePath: path.relative(process.cwd(), filePath)
      }));
    }
    
    // Stocker les dépendances pour l'analyse
    results.dependencies = astResults.imports.map(imp => ({
      source: imp.source,
      isRelative: imp.source.startsWith('.') || imp.source.startsWith('@/')
    }));
    
  } catch (err) {
    console.error(chalk.red(`Erreur lors de l'analyse du fichier ${filePath}: ${err.message}`));
  }
  
  return results;
}

module.exports = {
  scanDirectory,
  analyzeFile
};
