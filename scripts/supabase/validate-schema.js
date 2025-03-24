#!/usr/bin/env node
/**
 * Script pour valider le schéma Supabase
 * 
 * Ce script compare les types TypeScript actuels avec 
 * le schéma Supabase et vérifie que tout est synchronisé.
 * 
 * Usage: node scripts/supabase/validate-schema.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration
const CONFIG = {
  typesPath: path.resolve(process.cwd(), 'src/integrations/supabase/types.ts'),
  tempDir: path.resolve(process.cwd(), '.supabase-temp'),
  reportPath: path.resolve(process.cwd(), 'supabase-validation-report.md'),
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

// Vérifier que les variables d'environnement nécessaires sont définies
function checkEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }

  info('Toutes les variables d\'environnement requises sont définies.');
  return true;
}

// Générer les types actuels depuis Supabase
function generateCurrentTypes() {
  info('Génération des types actuels depuis Supabase...');

  // Créer le répertoire temporaire s'il n'existe pas
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
  }

  try {
    // Exécuter la commande Supabase pour générer les types
    execSync(
      `npx supabase gen types typescript --project-id "${process.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}" --schema public > ${CONFIG.tempDir}/current-types.ts`,
      { stdio: 'pipe' }
    );

    success('Types actuels générés avec succès.');
    return true;
  } catch (e) {
    return error(`Échec de la génération des types actuels: ${e.message}`);
  }
}

// Extraire les définitions de tables à partir des fichiers de types
function extractTableDefinitions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraction des noms de tables
    const tableRegex = /['"]Tables['"]\s*:\s*{([^}]+)}/gs;
    const tableMatch = content.match(tableRegex);
    
    if (!tableMatch) return null;
    
    // Extraire les noms de tables
    const tablesContent = tableMatch[0];
    const tableNameRegex = /['"]([^'"]+)['"]\s*:/g;
    const tableNames = [];
    let match;
    
    while ((match = tableNameRegex.exec(tablesContent)) !== null) {
      tableNames.push(match[1]);
    }
    
    return tableNames;
  } catch (e) {
    error(`Échec de l'extraction des définitions de tables: ${e.message}`);
    return null;
  }
}

// Comparer les schémas
function compareSchemas() {
  info('Comparaison des schémas...');
  
  // Lire les types existants
  if (!fs.existsSync(CONFIG.typesPath)) {
    return error(`Le fichier de types n'existe pas: ${CONFIG.typesPath}`);
  }
  
  // Extraire les tables des types existants
  const existingTables = extractTableDefinitions(CONFIG.typesPath);
  
  // Extraire les tables des types actuels
  const currentTables = extractTableDefinitions(`${CONFIG.tempDir}/current-types.ts`);
  
  if (!existingTables || !currentTables) {
    return error('Impossible de comparer les schémas en raison d\'erreurs d\'extraction.');
  }
  
  // Comparer les tables
  const missingTables = currentTables.filter(table => !existingTables.includes(table));
  const extraTables = existingTables.filter(table => !currentTables.includes(table));
  
  // Générer le rapport
  let report = `# Rapport de validation du schéma Supabase\n\n`;
  report += `*Généré le: ${new Date().toLocaleString()}*\n\n`;
  
  if (missingTables.length === 0 && extraTables.length === 0) {
    report += `## ✅ Schéma synchronisé\n\n`;
    report += `Les types TypeScript sont synchronisés avec le schéma Supabase.\n\n`;
    success('Les types sont synchronisés avec le schéma Supabase.');
  } else {
    report += `## ⚠️ Incohérences détectées\n\n`;
    
    if (missingTables.length > 0) {
      report += `### Tables manquantes dans les types existants\n\n`;
      missingTables.forEach(table => {
        report += `- \`${table}\`\n`;
      });
      report += `\n`;
      warn(`${missingTables.length} tables manquantes dans les types existants.`);
    }
    
    if (extraTables.length > 0) {
      report += `### Tables supplémentaires dans les types existants\n\n`;
      extraTables.forEach(table => {
        report += `- \`${table}\`\n`;
      });
      report += `\n`;
      warn(`${extraTables.length} tables supplémentaires dans les types existants.`);
    }
    
    report += `## 🛠️ Actions recommandées\n\n`;
    report += `Exécutez la commande suivante pour mettre à jour les types:\n\n`;
    report += `\`\`\`bash\nnpm run supabase:types\n\`\`\`\n\n`;
  }
  
  // Écrire le rapport
  fs.writeFileSync(CONFIG.reportPath, report);
  info(`Rapport généré: ${CONFIG.reportPath}`);
  
  return missingTables.length === 0 && extraTables.length === 0;
}

// Nettoyer les fichiers temporaires
function cleanup() {
  info('Nettoyage des fichiers temporaires...');
  try {
    fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
    success('Nettoyage terminé avec succès.');
  } catch (e) {
    warn(`Échec du nettoyage des fichiers temporaires: ${e.message}`);
  }
}

// Fonction principale
async function main() {
  log('\n🔍 Validation du schéma Supabase', colors.cyan);
  log('==============================\n');
  
  let exitCode = 0;
  
  try {
    if (!checkEnvironment()) {
      exitCode = 1;
    } else if (!generateCurrentTypes()) {
      exitCode = 1;
    } else if (!compareSchemas()) {
      exitCode = 1;
    }
    
    cleanup();
    
    if (exitCode === 0) {
      success('\nValidation du schéma terminée avec succès! 🎉\n');
    } else {
      log('\nValidation du schéma terminée avec des avertissements ou des erreurs.\n', colors.yellow);
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 