#!/usr/bin/env node
/**
 * Script pour exécuter ESLint sur tout le projet avec des rapports améliorés
 * 
 * Ce script exécute ESLint sur l'ensemble du projet et génère un rapport
 * détaillé des problèmes trouvés, avec des suggestions d'amélioration.
 * 
 * Usage: node scripts/code-quality/lint-all.js [--fix] [--report]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputDir: path.resolve(process.cwd(), 'reports'),
  reportFile: 'eslint-report.html',
  shouldFix: process.argv.includes('--fix'),
  generateReport: process.argv.includes('--report'),
  esLintPath: './node_modules/.bin/eslint',
  targetDirs: ['src'],
  excludePatterns: [
    'src/generated',
    'node_modules',
    'dist',
    'build',
    'coverage',
  ],
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

// Vérifier si ESLint est installé
function checkEsLintInstallation() {
  info('Vérification de l\'installation d\'ESLint...');
  
  try {
    if (!fs.existsSync(CONFIG.esLintPath)) {
      warn('ESLint n\'est pas installé. Installation en cours...');
      execSync('npm install --save-dev eslint', { stdio: 'inherit' });
    }
    
    // Vérifier également l'existence du fichier de configuration ESLint
    const eslintConfigPaths = [
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yaml',
      '.eslintrc.yml',
    ];
    
    const configExists = eslintConfigPaths.some(configPath => fs.existsSync(path.resolve(process.cwd(), configPath)));
    
    if (!configExists) {
      warn('Aucun fichier de configuration ESLint trouvé. Veuillez en créer un avant de continuer.');
      return false;
    }
    
    success('ESLint est correctement installé.');
    return true;
  } catch (e) {
    error(`Échec de la vérification de l'installation d'ESLint: ${e.message}`);
    return false;
  }
}

// Créer le répertoire de sortie pour les rapports
function createOutputDir() {
  if (CONFIG.generateReport) {
    info(`Création du répertoire de sortie pour les rapports...`);
    
    try {
      if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      }
      
      success(`Répertoire de sortie créé: ${CONFIG.outputDir}`);
      return true;
    } catch (e) {
      error(`Échec de la création du répertoire de sortie: ${e.message}`);
      return false;
    }
  }
  
  return true;
}

// Exécuter ESLint
function runEsLint() {
  info(`Exécution d'ESLint sur le projet...`);
  
  try {
    // Construction de la commande ESLint
    let command = `${CONFIG.esLintPath} --ext .js,.jsx,.ts,.tsx`;
    
    // Ajouter l'option de correction si nécessaire
    if (CONFIG.shouldFix) {
      command += ' --fix';
    }
    
    // Ajouter l'option de génération de rapport si nécessaire
    if (CONFIG.generateReport) {
      const reportPath = path.join(CONFIG.outputDir, CONFIG.reportFile);
      command += ` -f html -o ${reportPath}`;
    }
    
    // Ajouter les motifs d'exclusion
    CONFIG.excludePatterns.forEach(pattern => {
      command += ` --ignore-pattern ${pattern}`;
    });
    
    // Ajouter les répertoires cibles
    command += ` ${CONFIG.targetDirs.join(' ')}`;
    
    // Exécuter la commande
    info(`Commande: ${command}`);
    const result = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    
    success(`ESLint exécuté avec succès.`);
    return { success: true, output: result };
  } catch (e) {
    // ESLint renvoie un code d'erreur s'il trouve des problèmes
    // Ce n'est pas une erreur d'exécution, donc nous continuons
    warn(`ESLint a trouvé des problèmes dans votre code.`);
    return { success: false, output: e.stdout };
  }
}

// Analyser les résultats ESLint
function analyzeResults(output) {
  info(`Analyse des résultats...`);
  
  // Compter les erreurs et avertissements
  const errorRegex = /✖\s+(\d+)\s+problems\s+\((\d+)\s+errors,\s+(\d+)\s+warnings\)/;
  const match = output.match(errorRegex);
  
  if (match) {
    const [, problems, errors, warnings] = match.map(Number);
    
    return {
      problems,
      errors,
      warnings,
    };
  }
  
  return {
    problems: 0,
    errors: 0,
    warnings: 0,
  };
}

// Afficher les résultats
function displayResults(results, output) {
  if (results.problems === 0) {
    success(`\nAucun problème trouvé! Votre code est parfait. 🎉`);
  } else {
    // Afficher les statistiques
    warn(`\nRésultats de l'analyse:`);
    log(`Total des problèmes: ${results.problems}`, colors.magenta);
    if (results.errors > 0) {
      log(`Erreurs: ${results.errors}`, colors.red);
    }
    if (results.warnings > 0) {
      log(`Avertissements: ${results.warnings}`, colors.yellow);
    }
    
    // Afficher quelques lignes du résultat brut
    log('\nAperçu des problèmes:', colors.blue);
    const lines = output.split('\n');
    const relevantLines = lines.filter(line => line.includes('error') || line.includes('warning'));
    
    // Limiter à 10 lignes maximum
    const displayLines = relevantLines.slice(0, 10);
    displayLines.forEach(line => console.log(line));
    
    if (relevantLines.length > 10) {
      log(`... et ${relevantLines.length - 10} problèmes de plus.`, colors.yellow);
    }
    
    // Conseils pour résoudre les problèmes courants
    log('\nConseils pour résoudre les problèmes courants:', colors.green);
    log('1. Utilisez \'npm run lint -- --fix\' pour corriger automatiquement certains problèmes.');
    log('2. Consultez la documentation ESLint pour comprendre les règles: https://eslint.org/docs/rules/');
    log('3. Ajoutez /* eslint-disable rule-name */ pour désactiver temporairement une règle spécifique.');
    log('4. Pour les erreurs TypeScript, assurez-vous que vos types sont correctement définis.');
    
    // Si un rapport a été généré, afficher son emplacement
    if (CONFIG.generateReport) {
      const reportPath = path.join(CONFIG.outputDir, CONFIG.reportFile);
      info(`\nUn rapport détaillé a été généré à l'adresse: ${reportPath}`);
    }
  }
}

// Fonction principale
async function main() {
  log('\n🧹 Vérification de la qualité du code avec ESLint', colors.cyan);
  log('============================================\n');
  
  let exitCode = 0;
  
  try {
    // Vérifier l'installation d'ESLint
    if (!checkEsLintInstallation()) {
      exitCode = 1;
      return;
    }
    
    // Créer le répertoire de sortie pour les rapports
    if (!createOutputDir()) {
      exitCode = 1;
      return;
    }
    
    // Exécuter ESLint
    const { success: lintSuccess, output } = runEsLint();
    
    // Analyser les résultats
    const results = analyzeResults(output);
    
    // Afficher les résultats
    displayResults(results, output);
    
    // Définir le code de sortie
    if (!lintSuccess) {
      exitCode = 1;
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 