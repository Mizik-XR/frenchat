#!/usr/bin/env node
/**
 * Script pour générer les types TypeScript depuis le schéma Supabase
 * 
 * Ce script se connecte à Supabase et génère des définitions de types
 * pour toutes les tables, vues et fonctions de la base de données.
 * 
 * Usage: node scripts/supabase/generate-types.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration
const CONFIG = {
  outputPath: path.resolve(process.cwd(), 'src/integrations/supabase/types.ts'),
  tempDir: path.resolve(process.cwd(), '.supabase-temp'),
  packageManager: 'npm', // 'npm', 'yarn', ou 'pnpm'
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
  process.exit(1);
}

// Vérifier que les variables d'environnement nécessaires sont définies
function checkEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }

  info('Toutes les variables d'environnement requises sont définies.');
}

// Vérifier que Supabase CLI est installé
function checkSupabaseCLI() {
  try {
    const version = execSync('npx supabase --version', { stdio: 'pipe' }).toString().trim();
    info(`Version de Supabase CLI détectée: ${version}`);
  } catch (e) {
    warn('Supabase CLI n'est pas installé. Installation en cours...');
    try {
      execSync(`${CONFIG.packageManager} install @supabase/supabase-js supabase`, { stdio: 'inherit' });
      success('Supabase CLI installé avec succès.');
    } catch (installError) {
      error(`Échec de l'installation de Supabase CLI: ${installError.message}`);
    }
  }
}

// Générer les types TypeScript
function generateTypes() {
  info('Génération des types TypeScript depuis Supabase...');

  // Créer le répertoire temporaire s'il n'existe pas
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
  }

  try {
    // Exécuter la commande Supabase pour générer les types
    execSync(
      `npx supabase gen types typescript --project-id "${process.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}" --schema public > ${CONFIG.tempDir}/raw-types.ts`,
      { stdio: 'inherit' }
    );

    success('Types générés avec succès dans le répertoire temporaire.');
  } catch (e) {
    error(`Échec de la génération des types: ${e.message}`);
  }
}

// Améliorer les types générés avec des interfaces utilitaires supplémentaires
function enhanceTypes() {
  info('Amélioration des types générés...');

  try {
    // Lire les types bruts générés
    const rawTypes = fs.readFileSync(`${CONFIG.tempDir}/raw-types.ts`, 'utf8');

    // Ajouter des interfaces utilitaires supplémentaires
    const enhancedTypes = `/**
 * Types générés automatiquement depuis le schéma Supabase
 * Généré le: ${new Date().toLocaleString()}
 * 
 * NE PAS MODIFIER MANUELLEMENT CE FICHIER
 * Exécuter 'npm run supabase:types' pour régénérer
 */

${rawTypes}

/**
 * Interfaces utilitaires supplémentaires
 */

// Type pour les champs de table avec les relations
export type TablesWithRelations = Database['public']['Tables'];

// Helper type pour obtenir les types d'une table spécifique
export type TableRow<T extends keyof TablesWithRelations> = TablesWithRelations[T]['Row'];
export type TableInsert<T extends keyof TablesWithRelations> = TablesWithRelations[T]['Insert'];
export type TableUpdate<T extends keyof TablesWithRelations> = TablesWithRelations[T]['Update'];

// Helper pour les opérations CRUD
export type CrudOperations<T extends keyof TablesWithRelations> = {
  findOne: (id: string) => Promise<TableRow<T> | null>;
  findMany: (params?: any) => Promise<TableRow<T>[]>;
  create: (data: TableInsert<T>) => Promise<TableRow<T>>;
  update: (id: string, data: TableUpdate<T>) => Promise<TableRow<T>>;
  delete: (id: string) => Promise<boolean>;
};

// Type pour les vues
export type Views = Database['public']['Views'];
export type ViewRow<T extends keyof Views> = Views[T]['Row'];

// Type pour les noms de tables
export type TableNames = keyof TablesWithRelations;

// Type pour les noms de vues
export type ViewNames = keyof Views;

// Type pour les relations d'une table
export type TableRelations<T extends keyof TablesWithRelations> = 
  TablesWithRelations[T]['Relationships'];
`;

    // Écrire les types améliorés dans le fichier de sortie
    fs.mkdirSync(path.dirname(CONFIG.outputPath), { recursive: true });
    fs.writeFileSync(CONFIG.outputPath, enhancedTypes);

    success(`Types améliorés générés avec succès dans ${CONFIG.outputPath}`);
  } catch (e) {
    error(`Échec de l'amélioration des types: ${e.message}`);
  }
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
  log('\n📦 Génération des types TypeScript depuis Supabase', colors.cyan);
  log('=================================================\n');

  try {
    checkEnvironment();
    checkSupabaseCLI();
    generateTypes();
    enhanceTypes();
    cleanup();

    success('\nGénération des types terminée avec succès! 🎉\n');
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
  }
}

// Exécuter la fonction principale
main(); 