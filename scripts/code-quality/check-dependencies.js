#!/usr/bin/env node
/**
 * Script pour vérifier les dépendances circulaires et les imports directs
 * 
 * Ce script analyse le code source pour détecter deux types de problèmes:
 * 1. Dépendances circulaires entre modules
 * 2. Imports directs de React (au lieu d'utiliser le module centralisé)
 * 
 * Usage: node scripts/code-quality/check-dependencies.js
 * Options:
 *   --report-only    Générer uniquement un rapport sans échouer en cas de problèmes
 *   --fix            Tenter de corriger automatiquement les problèmes d'import React
 */

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const util = require('util');
const glob = require('glob');
const exec = util.promisify(child_process.exec);

// Configuration
const CONFIG = {
  srcDir: 'src',
  ignoredPaths: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/public/**',
    '**/core/reactInstance.ts',
  ],
  outputFile: 'dependency-report.md',
  reactInstancePath: 'src/core/reactInstance.ts',
  reportOnly: process.argv.includes('--report-only'),
  fixReactImports: process.argv.includes('--fix'),
  // Schéma de dépendances critiques à vérifier
  criticalDependencies: [
    {
      module: 'APP_STATE',
      shouldNotImport: ['supabase', 'supabaseClient']
    },
    {
      module: 'supabase',
      shouldNotImport: ['APP_STATE', 'appState']
    }
  ]
};

// Utilitaires de journalisation
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.cyan);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warn(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

// Vérifier si madge est installé
async function checkDependencies() {
  try {
    info('Vérification des dépendances...');
    
    try {
      await exec('madge --version');
      success('madge est installé');
    } catch (e) {
      warn('madge n\'est pas installé. Installation en cours...');
      await exec('npm install -g madge');
      success('madge a été installé avec succès');
    }
    
    return true;
  } catch (err) {
    error(`Erreur lors de la vérification/installation des dépendances: ${err.message}`);
    return false;
  }
}

// Trouver les dépendances circulaires avec madge
async function findCircularDependencies() {
  info('Recherche des dépendances circulaires...');
  
  try {
    const { stdout } = await exec(`npx madge --circular --extensions ts,tsx,js,jsx ${CONFIG.srcDir}`);
    
    if (stdout.trim()) {
      const circularDeps = stdout.trim().split('\n').filter(line => line.trim() !== '');
      warn(`${circularDeps.length} dépendances circulaires trouvées`);
      return circularDeps;
    } else {
      success('Aucune dépendance circulaire trouvée');
      return [];
    }
  } catch (err) {
    error(`Erreur lors de la recherche des dépendances circulaires: ${err.message}`);
    return [];
  }
}

// Rechercher les imports directs de React
function findDirectReactImports() {
  info('Recherche des imports directs de React...');
  
  try {
    const importPatterns = [
      /import\s+React(?:,\s*{([^}]*)})?\s+from\s+['"]react['"]/g,
      /import\s+{\s*([^}]*)\s*}\s+from\s+['"]react['"]/g
    ];
    
    const files = glob.sync(`${CONFIG.srcDir}/**/*.{js,jsx,ts,tsx}`, { ignore: CONFIG.ignoredPaths });
    const directImports = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of importPatterns) {
        while (pattern.exec(content) !== null) {
          directImports.push(file);
          break; // Un seul match par fichier suffit
        }
        pattern.lastIndex = 0; // Réinitialiser le regex
      }
    }
    
    if (directImports.length > 0) {
      warn(`${directImports.length} fichiers avec des imports directs de React trouvés`);
    } else {
      success('Aucun import direct de React trouvé');
    }
    
    return directImports;
  } catch (err) {
    error(`Erreur lors de la recherche des imports directs de React: ${err.message}`);
    return [];
  }
}

// Vérifier les dépendances critiques
function checkCriticalDependencies() {
  info('Vérification des dépendances critiques...');
  
  try {
    const issues = [];
    
    for (const dep of CONFIG.criticalDependencies) {
      const regex = new RegExp(`import\\s+.*\\s+from\\s+['"][^'"]*${dep.shouldNotImport.join('|')}['"]`, 'g');
      const files = glob.sync(`${CONFIG.srcDir}/**/*${dep.module}*.{js,jsx,ts,tsx}`, { ignore: CONFIG.ignoredPaths });
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(regex);
        
        if (matches) {
          for (const match of matches) {
            issues.push({
              file,
              module: dep.module,
              shouldNotImport: dep.shouldNotImport.find(m => match.includes(m)),
              line: match.trim()
            });
          }
        }
      }
    }
    
    if (issues.length > 0) {
      warn(`${issues.length} problèmes de dépendances critiques trouvés`);
    } else {
      success('Aucun problème de dépendances critiques trouvé');
    }
    
    return issues;
  } catch (err) {
    error(`Erreur lors de la vérification des dépendances critiques: ${err.message}`);
    return [];
  }
}

// Générer un rapport
function generateReport(circularDeps, directImports, criticalIssues) {
  info('Génération du rapport...');
  
  try {
    const reportContent = [
      '# Rapport d\'analyse des dépendances',
      '',
      `*Généré le ${new Date().toLocaleString()}*`,
      '',
      '## Dépendances circulaires',
      '',
      circularDeps.length > 0 
        ? circularDeps.map(dep => `- ${dep}`).join('\n') 
        : 'Aucune dépendance circulaire trouvée ✅',
      '',
      '## Imports directs de React',
      '',
      directImports.length > 0 
        ? directImports.map(file => `- ${file}`).join('\n') 
        : 'Aucun import direct de React trouvé ✅',
      '',
      '## Problèmes de dépendances critiques',
      '',
      criticalIssues.length > 0 
        ? criticalIssues.map(issue => (
            `- **${issue.file}**: Le module \`${issue.module}\` ne devrait pas importer \`${issue.shouldNotImport}\`\n  \`${issue.line}\``
          )).join('\n\n')
        : 'Aucun problème de dépendances critiques trouvé ✅',
      '',
      '## Recommandations',
      '',
      circularDeps.length > 0 || directImports.length > 0 || criticalIssues.length > 0 
        ? [
            '### Pour résoudre les dépendances circulaires:',
            '- Créer des modules intermédiaires pour les types partagés',
            '- Utiliser le pattern d\'injection de dépendances',
            '- Restructurer les modules pour éviter les imports mutuels',
            '',
            '### Pour corriger les imports directs de React:',
            '- Utiliser `import React from \'@/core/reactInstance\'` à la place de `import React from \'react\'`',
            '- Exécuter `node scripts/code-quality/fix-react-imports.js --fix` pour corriger automatiquement',
            '',
            '### Pour les problèmes de dépendances critiques:',
            '- Réorganiser le code pour respecter l\'architecture définie',
            '- Utiliser des services ou des adaptateurs pour découpler les modules',
          ].join('\n')
        : 'Félicitations ! Aucun problème de dépendances détecté dans le code. 🎉',
    ].join('\n');
    
    fs.writeFileSync(CONFIG.outputFile, reportContent, 'utf8');
    success(`Rapport généré: ${CONFIG.outputFile}`);
    return true;
  } catch (err) {
    error(`Erreur lors de la génération du rapport: ${err.message}`);
    return false;
  }
}

// Vérification du fichier centralisé React
function checkReactInstanceExists() {
  if (!fs.existsSync(CONFIG.reactInstancePath)) {
    warn(`Le fichier ${CONFIG.reactInstancePath} n'existe pas.`);
    warn('Créez ce fichier pour centraliser les imports de React et éviter les problèmes de versions multiples.');
    return false;
  }
  return true;
}

// Fonction principale
async function main() {
  info('Démarrage de l\'analyse des dépendances...');
  
  // Vérifier les dépendances
  const depsOk = await checkDependencies();
  if (!depsOk) {
    error('Impossible de continuer sans les dépendances requises.');
    process.exit(1);
  }
  
  // Vérifier l'existence du fichier reactInstance
  checkReactInstanceExists();
  
  // Collecter les résultats des différentes vérifications
  const circularDeps = await findCircularDependencies();
  const directImports = findDirectReactImports();
  const criticalIssues = checkCriticalDependencies();
  
  // Générer le rapport
  generateReport(circularDeps, directImports, criticalIssues);
  
  // Déterminer si l'exécution a réussi ou échoué
  const hasIssues = circularDeps.length > 0 || directImports.length > 0 || criticalIssues.length > 0;
  
  if (hasIssues) {
    if (CONFIG.reportOnly) {
      warn('Des problèmes ont été détectés, mais le script s\'exécute en mode rapport uniquement.');
      info(`Consultez ${CONFIG.outputFile} pour plus de détails.`);
    } else {
      error('Des problèmes de dépendances ont été détectés.');
      info(`Consultez ${CONFIG.outputFile} pour plus de détails.`);
      process.exit(1);
    }
  } else {
    success('Aucun problème de dépendances détecté !');
  }
}

// Exécuter le script
main(); 