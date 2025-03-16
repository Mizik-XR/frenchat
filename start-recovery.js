
/**
 * Script de démarrage en mode récupération pour FileChat
 * 
 * Ce script démarre l'application avec:
 * - Un ensemble minimal de composants
 * - Une configuration Vite optimisée
 * - Le mode Cloud forcé
 * - Des diagnostics détaillés
 * 
 * Usage: node start-recovery.js
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Configuration du mode de récupération
const ENV_CONFIG = {
  // Forcer le mode de récupération pour la configuration Vite
  RECOVERY_MODE: 'true',
  // Forcer le mode cloud pour éviter les problèmes d'IA locale
  VITE_CLOUD_MODE: 'true',
  // Désactiver le mode de développement qui peut causer des problèmes
  VITE_DISABLE_DEV_MODE: '1',
  // Activer le mode de débogage
  VITE_DEBUG_MODE: 'true',
  // Activer les logs détaillés
  VITE_VERBOSE_LOGGING: 'true',
  // Désactiver les fonctions avancées pour le diagnostic
  VITE_DISABLE_ADVANCED_FEATURES: 'true',
  // Environnement Node.js
  NODE_ENV: 'development',
  // Augmenter la mémoire disponible pour Node
  NODE_OPTIONS: '--max-old-space-size=4096'
};

/**
 * Affiche un message formaté dans la console
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = '';
  
  switch (type) {
    case 'error':
      prefix = `${colors.red}[ERREUR]${colors.reset}`;
      break;
    case 'success':
      prefix = `${colors.green}[SUCCÈS]${colors.reset}`;
      break;
    case 'warning':
      prefix = `${colors.yellow}[ATTENTION]${colors.reset}`;
      break;
    case 'info':
    default:
      prefix = `${colors.blue}[INFO]${colors.reset}`;
      break;
  }
  
  console.log(`${prefix} ${timestamp} - ${message}`);
}

/**
 * Vérifie les prérequis du système
 */
function checkPrerequisites() {
  log('Vérification des prérequis...');
  
  // Vérifier que Node.js est installé
  if (!process.version) {
    log('Node.js est requis pour exécuter ce script.', 'error');
    process.exit(1);
  }
  
  log(`Node.js version: ${process.version}`, 'success');
  log(`Plateforme: ${os.platform()} ${os.release()}`, 'info');
  log(`Mémoire système: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} Go`, 'info');
  
  // Vérifier que le dossier src existe
  if (!fs.existsSync(path.join(__dirname, 'src'))) {
    log('Dossier src non trouvé. Assurez-vous d\'exécuter ce script depuis la racine du projet.', 'error');
    process.exit(1);
  }
  
  // Vérifier que package.json existe
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    log('Fichier package.json non trouvé.', 'error');
    process.exit(1);
  }
  
  log('Tous les prérequis sont satisfaits.', 'success');
}

/**
 * Configure l'environnement pour le mode récupération
 */
function setupEnvironment() {
  log('Configuration de l\'environnement en mode récupération...');
  
  // Créer ou mettre à jour .env.development.local
  const envFilePath = path.join(__dirname, '.env.development.local');
  let envContent = '';
  
  // Ajouter chaque variable d'environnement
  for (const [key, value] of Object.entries(ENV_CONFIG)) {
    envContent += `${key}=${value}\n`;
  }
  
  try {
    fs.writeFileSync(envFilePath, envContent);
    log(`Fichier .env.development.local créé avec succès.`, 'success');
  } catch (err) {
    log(`Erreur lors de la création du fichier d'environnement: ${err.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Lance l'application en mode développement
 */
function startApp() {
  log('Démarrage de l\'application en mode récupération...');
  
  // Définir l'environnement pour le processus enfant
  const env = { ...process.env, ...ENV_CONFIG };
  
  // Commande pour démarrer l'application
  const startCommand = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  
  log('Exécution de npm run dev avec configuration optimisée...', 'info');
  
  // Lancer l'application
  const child = spawn(startCommand, ['run', 'dev'], { 
    env, 
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (error) => {
    log(`Erreur lors du démarrage de l'application: ${error.message}`, 'error');
    process.exit(1);
  });
  
  process.on('SIGINT', () => {
    log('Arrêt de l\'application...', 'warning');
    child.kill('SIGINT');
    process.exit(0);
  });
}

/**
 * Principale fonction d'exécution
 */
function run() {
  console.log(`
${colors.bright}${colors.magenta}=======================================${colors.reset}
${colors.bright}${colors.magenta}  FILECHAT - MODE DE RÉCUPÉRATION     ${colors.reset}
${colors.bright}${colors.magenta}=======================================${colors.reset}

Ce script démarre l'application en mode de récupération
avec une configuration optimisée pour résoudre les
problèmes de chargement et de dépendances circulaires.

Le mode de récupération:
- Force le mode Cloud
- Désactive les fonctionnalités avancées
- Utilise une configuration Vite optimisée
- Active les logs de débogage détaillés

${colors.yellow}IMPORTANT: Ce mode est destiné au diagnostic uniquement.${colors.reset}
`);

  // Vérifier les prérequis
  checkPrerequisites();
  
  // Configurer l'environnement
  setupEnvironment();
  
  // Lancer l'application
  startApp();
}

// Exécuter le script
run();
