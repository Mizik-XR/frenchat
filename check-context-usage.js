
/**
 * Script de vérification des usages de createContext et des dépendances circulaires
 * 
 * Version optimisée utilisant un analyseur AST au lieu d'expressions régulières
 * Architecture modulaire avec séparation des responsabilités
 * 
 * Utilisation: node check-context-usage.js
 */

const path = require('path');
const chalk = require('chalk');
const { scanDirectory } = require('./src/scripts/analyze/file-scanner');
const { detectCircularDependencies, generateCircularDependencySuggestions } = require('./src/scripts/analyze/dependency-analyzer');
const { generateReport } = require('./src/scripts/analyze/report-generator');

/**
 * Point d'entrée principal du script
 */
function run() {
  console.log(chalk.blue('=== Vérification des usages de createContext et des dépendances circulaires ==='));
  console.log(chalk.blue('Ce script utilise un analyseur AST pour une détection précise des problèmes.'));
  console.log();
  
  // Répertoire racine du projet
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  
  console.log(`Analyse du répertoire: ${srcDir}`);
  console.log('Veuillez patienter, cela peut prendre quelques instants...');
  
  // Lancer l'analyse
  const startTime = Date.now();
  const results = scanDirectory(srcDir);
  
  // Analyser les dépendances circulaires
  const circularDeps = detectCircularDependencies(results.dependencies);
  const suggestions = generateCircularDependencySuggestions(circularDeps);
  
  // Générer et afficher le rapport
  generateReport(results, circularDeps, suggestions);
  
  // Afficher le temps d'exécution
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  console.log(`\nAnalyse terminée en ${duration.toFixed(2)} secondes.`);
  
  // Retourner un code d'erreur si des problèmes ont été détectés
  if (results.totalIssues > 0 || circularDeps.length > 0) {
    process.exit(1);
  }
}

// Lancer le script
run();
