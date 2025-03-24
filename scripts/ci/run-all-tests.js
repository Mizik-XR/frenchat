#!/usr/bin/env node
/**
 * Script pour exécuter tous les types de tests du projet
 * 
 * Ce script exécute les tests unitaires, d'intégration et de performances
 * et génère des rapports détaillés pour chaque type de test.
 * 
 * Usage: node scripts/ci/run-all-tests.js [--unit-only|--integration-only|--perf-only]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  reportsDir: path.resolve(process.cwd(), 'reports'),
  coverageDir: path.resolve(process.cwd(), 'coverage'),
  runUnitTests: !process.argv.some(arg => 
    arg === '--integration-only' || arg === '--perf-only'
  ),
  runIntegrationTests: !process.argv.some(arg => 
    arg === '--unit-only' || arg === '--perf-only'
  ),
  runPerfTests: !process.argv.some(arg => 
    arg === '--unit-only' || arg === '--integration-only'
  ),
  unitTestsGlob: 'src/**/*.test.{js,jsx,ts,tsx}',
  integrationTestsGlob: 'tests/integration/**/*.test.{js,jsx,ts,tsx}',
  perfTestsCommand: 'npx lighthouse http://localhost:5173 --output json --output html --output-path ./reports/lighthouse-report',
  setupScript: path.resolve(process.cwd(), 'scripts/ci/setup-tests.js'),
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

// Exécuter le script de configuration des tests si nécessaire
function setupTestEnvironment() {
  info('Configuration de l\'environnement de test...');
  
  try {
    if (fs.existsSync(CONFIG.setupScript)) {
      execSync(`node ${CONFIG.setupScript}`, { stdio: 'inherit' });
      success('Environnement de test configuré avec succès.');
      return true;
    } else {
      warn(`Script de configuration des tests non trouvé: ${CONFIG.setupScript}`);
      warn('L\'environnement de test n\'a pas été configuré automatiquement.');
      return true;
    }
  } catch (e) {
    error(`Échec de la configuration de l'environnement de test: ${e.message}`);
    return false;
  }
}

// Créer les répertoires de rapports
function createReportDirectories() {
  info('Création des répertoires de rapports...');
  
  try {
    if (!fs.existsSync(CONFIG.reportsDir)) {
      fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
    }
    
    if (!fs.existsSync(CONFIG.coverageDir)) {
      fs.mkdirSync(CONFIG.coverageDir, { recursive: true });
    }
    
    success('Répertoires de rapports créés avec succès.');
    return true;
  } catch (e) {
    error(`Échec de la création des répertoires de rapports: ${e.message}`);
    return false;
  }
}

// Exécuter les tests unitaires
function runUnitTests() {
  if (!CONFIG.runUnitTests) {
    info('Tests unitaires ignorés.');
    return true;
  }
  
  info('Exécution des tests unitaires...');
  
  try {
    // Exécuter les tests unitaires avec Jest
    execSync(`npx jest ${CONFIG.unitTestsGlob} --coverage --coverageDirectory=${CONFIG.coverageDir} --json --outputFile=${CONFIG.reportsDir}/unit-tests-report.json`, { stdio: 'inherit' });
    
    success('Tests unitaires exécutés avec succès.');
    return true;
  } catch (e) {
    error(`Échec des tests unitaires: ${e.message}`);
    return false;
  }
}

// Exécuter les tests d'intégration
function runIntegrationTests() {
  if (!CONFIG.runIntegrationTests) {
    info('Tests d\'intégration ignorés.');
    return true;
  }
  
  info('Exécution des tests d\'intégration...');
  
  try {
    // Exécuter les tests d'intégration avec Jest
    execSync(`npx jest ${CONFIG.integrationTestsGlob} --json --outputFile=${CONFIG.reportsDir}/integration-tests-report.json`, { stdio: 'inherit' });
    
    success('Tests d\'intégration exécutés avec succès.');
    return true;
  } catch (e) {
    error(`Échec des tests d'intégration: ${e.message}`);
    return false;
  }
}

// Exécuter les tests de performance
function runPerformanceTests() {
  if (!CONFIG.runPerfTests) {
    info('Tests de performance ignorés.');
    return true;
  }
  
  info('Exécution des tests de performance...');
  
  try {
    // Vérifier si le serveur de développement est en cours d'exécution
    let isServerRunning = false;
    try {
      execSync('curl -s http://localhost:5173 > /dev/null');
      isServerRunning = true;
    } catch (err) {
      warn('Le serveur de développement n\'est pas en cours d\'exécution. Démarrage du serveur...');
      
      // Démarrer le serveur de développement en arrière-plan
      const child = require('child_process').spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      
      // Attendre que le serveur soit prêt
      info('Attente du démarrage du serveur de développement...');
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        try {
          execSync('curl -s http://localhost:5173 > /dev/null', { stdio: 'ignore' });
          isServerRunning = true;
          break;
        } catch (e) {
          attempts++;
          // Attendre 1 seconde
          execSync('sleep 1');
        }
      }
      
      if (!isServerRunning) {
        throw new Error('Impossible de démarrer le serveur de développement.');
      }
    }
    
    // Exécuter Lighthouse pour les tests de performance
    execSync(CONFIG.perfTestsCommand, { stdio: 'inherit' });
    
    success('Tests de performance exécutés avec succès.');
    return true;
  } catch (e) {
    error(`Échec des tests de performance: ${e.message}`);
    return false;
  }
}

// Générer un rapport récapitulatif
function generateSummaryReport() {
  info('Génération du rapport récapitulatif...');
  
  try {
    let summary = `# Rapport de tests\n\n`;
    summary += `*Généré le: ${new Date().toLocaleString()}*\n\n`;
    
    // Récupérer les résultats des tests unitaires
    if (CONFIG.runUnitTests) {
      const unitTestsReportPath = path.join(CONFIG.reportsDir, 'unit-tests-report.json');
      if (fs.existsSync(unitTestsReportPath)) {
        const unitTestsReport = JSON.parse(fs.readFileSync(unitTestsReportPath, 'utf8'));
        
        summary += `## Tests unitaires\n\n`;
        summary += `- **Résultat**: ${unitTestsReport.success ? '✅ Succès' : '❌ Échec'}\n`;
        summary += `- **Tests**: ${unitTestsReport.numTotalTests}\n`;
        summary += `- **Réussis**: ${unitTestsReport.numPassedTests}\n`;
        summary += `- **Échecs**: ${unitTestsReport.numFailedTests}\n`;
        
        if (unitTestsReport.coverageMap) {
          summary += `- **Couverture**: ${unitTestsReport.coverageMap.map(cov => `${cov.lines.pct}%`).join(', ')}\n`;
        }
        
        summary += `\n`;
      } else {
        summary += `## Tests unitaires\n\n`;
        summary += `⚠️ Rapport de tests unitaires non trouvé.\n\n`;
      }
    }
    
    // Récupérer les résultats des tests d'intégration
    if (CONFIG.runIntegrationTests) {
      const integrationTestsReportPath = path.join(CONFIG.reportsDir, 'integration-tests-report.json');
      if (fs.existsSync(integrationTestsReportPath)) {
        const integrationTestsReport = JSON.parse(fs.readFileSync(integrationTestsReportPath, 'utf8'));
        
        summary += `## Tests d'intégration\n\n`;
        summary += `- **Résultat**: ${integrationTestsReport.success ? '✅ Succès' : '❌ Échec'}\n`;
        summary += `- **Tests**: ${integrationTestsReport.numTotalTests}\n`;
        summary += `- **Réussis**: ${integrationTestsReport.numPassedTests}\n`;
        summary += `- **Échecs**: ${integrationTestsReport.numFailedTests}\n\n`;
      } else {
        summary += `## Tests d'intégration\n\n`;
        summary += `⚠️ Rapport de tests d'intégration non trouvé.\n\n`;
      }
    }
    
    // Récupérer les résultats des tests de performance
    if (CONFIG.runPerfTests) {
      const perfTestsReportPath = path.join(CONFIG.reportsDir, 'lighthouse-report.json');
      if (fs.existsSync(perfTestsReportPath)) {
        const perfTestsReport = JSON.parse(fs.readFileSync(perfTestsReportPath, 'utf8'));
        
        summary += `## Tests de performance\n\n`;
        summary += `- **Performance**: ${perfTestsReport.categories.performance.score * 100}%\n`;
        summary += `- **Accessibilité**: ${perfTestsReport.categories.accessibility.score * 100}%\n`;
        summary += `- **Meilleures pratiques**: ${perfTestsReport.categories['best-practices'].score * 100}%\n`;
        summary += `- **SEO**: ${perfTestsReport.categories.seo.score * 100}%\n\n`;
      } else {
        summary += `## Tests de performance\n\n`;
        summary += `⚠️ Rapport de tests de performance non trouvé.\n\n`;
      }
    }
    
    // Écrire le rapport récapitulatif
    const summaryReportPath = path.join(CONFIG.reportsDir, 'summary-report.md');
    fs.writeFileSync(summaryReportPath, summary, 'utf8');
    
    success(`Rapport récapitulatif généré avec succès: ${summaryReportPath}`);
    return true;
  } catch (e) {
    error(`Échec de la génération du rapport récapitulatif: ${e.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  log('\n🧪 Exécution des tests', colors.cyan);
  log('===================\n');
  
  let exitCode = 0;
  
  try {
    // Configuration de l'environnement de test
    if (!setupTestEnvironment()) {
      exitCode = 1;
      return;
    }
    
    // Créer les répertoires de rapports
    if (!createReportDirectories()) {
      exitCode = 1;
      return;
    }
    
    // Exécuter les tests unitaires
    if (!runUnitTests()) {
      exitCode = 1;
    }
    
    // Exécuter les tests d'intégration
    if (!runIntegrationTests()) {
      exitCode = 1;
    }
    
    // Exécuter les tests de performance
    if (!runPerformanceTests()) {
      exitCode = 1;
    }
    
    // Générer un rapport récapitulatif
    if (!generateSummaryReport()) {
      exitCode = 1;
    }
    
    if (exitCode === 0) {
      success('\nTous les tests ont été exécutés avec succès! 🎉\n');
    } else {
      warn('\nCertains tests ont échoué. Consultez les rapports pour plus de détails.\n');
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 