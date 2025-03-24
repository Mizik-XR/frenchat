#!/usr/bin/env node
/**
 * Script pour exécuter les migrations Supabase
 * 
 * Ce script exécute les migrations Supabase et 
 * met à jour automatiquement les types TypeScript.
 * 
 * Usage: node scripts/supabase/run-migrations.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration
const CONFIG = {
  migrationsDir: path.resolve(process.cwd(), 'supabase/migrations'),
  packageManager: 'npm', // 'npm', 'yarn', ou 'pnpm'
  logFile: path.resolve(process.cwd(), 'supabase-migrations.log'),
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
  const logMessage = `${new Date().toISOString()} - ${message}`;
  console.log(`${color}${message}${colors.reset}`);
  fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
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
    'SUPABASE_ACCESS_TOKEN',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }

  info('Toutes les variables d\'environnement requises sont définies.');
  return true;
}

// Vérifier que Supabase CLI est installé
function checkSupabaseCLI() {
  try {
    const version = execSync('npx supabase --version', { stdio: 'pipe' }).toString().trim();
    info(`Version de Supabase CLI détectée: ${version}`);
    return true;
  } catch (e) {
    warn('Supabase CLI n\'est pas installé. Installation en cours...');
    try {
      execSync(`${CONFIG.packageManager} install @supabase/supabase-js supabase`, { stdio: 'inherit' });
      success('Supabase CLI installé avec succès.');
      return true;
    } catch (installError) {
      error(`Échec de l'installation de Supabase CLI: ${installError.message}`);
      return false;
    }
  }
}

// Vérifier les migrations disponibles
function checkMigrations() {
  info('Vérification des migrations disponibles...');

  if (!fs.existsSync(CONFIG.migrationsDir)) {
    return error(`Le répertoire de migrations n'existe pas: ${CONFIG.migrationsDir}`);
  }

  const migrations = fs.readdirSync(CONFIG.migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    warn('Aucune migration trouvée.');
    return false;
  }

  info(`${migrations.length} migrations trouvées:`);
  migrations.forEach((migration, index) => {
    console.log(`  ${index + 1}. ${migration}`);
  });

  return true;
}

// Exécuter les migrations
function runMigrations() {
  info('Exécution des migrations...');

  try {
    // Récupérer l'ID du projet Supabase
    const projectId = process.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0];
    
    // Exécuter les migrations avec Supabase CLI
    execSync(
      `npx supabase db push --project-id ${projectId} --db-url ${process.env.VITE_SUPABASE_URL}/rest/v1`,
      { stdio: 'inherit' }
    );

    success('Migrations exécutées avec succès.');
    return true;
  } catch (e) {
    return error(`Échec de l'exécution des migrations: ${e.message}`);
  }
}

// Mettre à jour les types TypeScript
function updateTypes() {
  info('Mise à jour des types TypeScript...');

  try {
    execSync(`${CONFIG.packageManager} run supabase:types`, { stdio: 'inherit' });
    success('Types TypeScript mis à jour avec succès.');
    return true;
  } catch (e) {
    return error(`Échec de la mise à jour des types TypeScript: ${e.message}`);
  }
}

// Fonction principale
async function main() {
  log('\n🚀 Exécution des migrations Supabase', colors.cyan);
  log('===================================\n');

  // Créer le fichier de log s'il n'existe pas
  if (!fs.existsSync(path.dirname(CONFIG.logFile))) {
    fs.mkdirSync(path.dirname(CONFIG.logFile), { recursive: true });
  }
  
  // Écrire l'en-tête du log
  fs.writeFileSync(CONFIG.logFile, `# Journal des migrations Supabase\n# Démarré le: ${new Date().toLocaleString()}\n\n`);

  let exitCode = 0;

  try {
    if (!checkEnvironment()) {
      exitCode = 1;
    } else if (!checkSupabaseCLI()) {
      exitCode = 1;
    } else if (!checkMigrations()) {
      info('Pas de migrations à exécuter.');
    } else if (!runMigrations()) {
      exitCode = 1;
    } else if (!updateTypes()) {
      exitCode = 1;
    }

    if (exitCode === 0) {
      success('\nExécution des migrations terminée avec succès! 🎉\n');
    } else {
      log('\nExécution des migrations terminée avec des avertissements ou des erreurs.\n', colors.yellow);
    }
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }

  // Ajouter une ligne de fin au log
  fs.appendFileSync(CONFIG.logFile, `\n# Terminé le: ${new Date().toLocaleString()}\n# Statut: ${exitCode === 0 ? 'Succès' : 'Échec'}\n`);

  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 