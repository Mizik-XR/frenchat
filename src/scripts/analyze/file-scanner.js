
/**
 * Scanner de fichiers pour l'analyse des dépendances
 * Utilise l'analyseur AST au lieu d'expressions régulières
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { analyzeWithAST } = require('./ast-analyzer');

// Extensions à analyser
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Répertoires à ignorer
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', '.vscode', 'coverage'];

/**
 * Vérifie si un chemin est un fichier avec une extension valide
 * @param {string} filePath - Chemin du fichier à vérifier
 * @returns {boolean} True si c'est un fichier valide pour l'analyse
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
 * @param {string} sourcePath - Chemin du fichier source
 * @param {string} importPath - Chemin d'importation à résoudre
 * @returns {string|null} Chemin résolu ou null si non résolvable
 */
function resolveImportPath(sourcePath, importPath) {
  const rootDir = process.cwd();
  
  if (importPath.startsWith('@/')) {
    // Alias @ pointe vers src/
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
 * @param {string} basePath - Chemin du fichier de base
 * @param {string} importPath - Chemin d'importation
 * @returns {string|null} Chemin complet résolu ou null
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
 * Parcourt un dossier et analyse les fichiers
 * @param {string} directory - Répertoire à analyser
 * @returns {Object} Résultats de l'analyse
 */
function scanDirectory(directory) {
  console.log(chalk.blue(`Analyse du répertoire: ${directory}`));
  
  const results = {
    files: new Set(),
    dependencies: new Map(),
    problems: [],
    totalIssues: 0
  };
  
  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.includes(entry.name)) {
            scanDir(fullPath);
          }
        } else if (isValidFile(fullPath)) {
          analyzeFile(fullPath, results);
        }
      }
    } catch (err) {
      console.error(chalk.red(`Erreur lors de l'analyse du dossier ${dir}:`), err.message);
    }
  }
  
  // Démarrer l'analyse
  scanDir(directory);
  
  // Compter le nombre total de problèmes
  results.totalIssues = results.problems.length;
  
  return results;
}

/**
 * Analyse un fichier individuel
 * @param {string} filePath - Chemin du fichier à analyser
 * @param {Object} results - Objet pour collecter les résultats
 */
function analyzeFile(filePath, results) {
  if (results.files.has(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.files.add(filePath);
    
    // Utiliser l'analyseur AST pour extraire les imports et problèmes
    const { problems, imports } = analyzeWithAST(filePath, content);
    
    // Ajouter les problèmes détectés
    if (problems.length > 0) {
      problems.forEach(problem => {
        const relativePath = path.relative(process.cwd(), filePath);
        results.problems.push({
          ...problem,
          file: relativePath
        });
      });
    }
    
    // Traiter les dépendances
    const dependencies = [];
    
    for (const importData of imports) {
      const importPath = importData.source;
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        const resolvedPath = resolveFullFilePath(filePath, importPath);
        
        if (resolvedPath) {
          dependencies.push({
            source: resolvedPath,
            isRelative: importPath.startsWith('.')
          });
          
          // Analyser récursivement les dépendances
          analyzeFile(resolvedPath, results);
        }
      }
    }
    
    // Stocker les dépendances
    results.dependencies.set(filePath, dependencies);
    
  } catch (err) {
    console.error(chalk.red(`Erreur lors de l'analyse du fichier ${filePath}:`), err.message);
  }
}

module.exports = {
  scanDirectory,
  isValidFile,
  resolveImportPath,
  resolveFullFilePath
};
