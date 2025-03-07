
/**
 * Script de vérification de la configuration Netlify
 * Ce script vérifie la présence des fichiers nécessaires et la configuration
 * pour assurer un déploiement correct sur Netlify.
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(type, message) {
  const typeColors = {
    'INFO': colors.blue,
    'OK': colors.green,
    'ATTENTION': colors.yellow,
    'ERREUR': colors.red
  };
  
  const color = typeColors[type] || colors.reset;
  console.log(`${color}[${type}]${colors.reset} ${message}`);
}

// Vérifie l'existence d'un fichier
function checkFileExists(filePath, isRequired = true) {
  const exists = fs.existsSync(filePath);
  const fileName = path.basename(filePath);
  
  if (exists) {
    log('OK', `${fileName} est présent`);
    return true;
  } else if (isRequired) {
    log('ATTENTION', `${fileName} est manquant!`);
    return false;
  } else {
    log('INFO', `${fileName} est manquant (optionnel)`);
    return false;
  }
}

// Vérifie si la configuration de base dans vite.config.ts est correcte
function checkViteConfig() {
  const viteConfigPath = path.resolve('./vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    log('ERREUR', 'vite.config.ts introuvable!');
    return false;
  }
  
  const content = fs.readFileSync(viteConfigPath, 'utf-8');
  
  // Vérifie si base: './' est défini
  if (!content.includes("base: './'") && !content.includes('base: "./"')) {
    log('ATTENTION', "La configuration de base n'est pas définie sur './' dans vite.config.ts");
    log('INFO', "Ajoutez base: './' dans la configuration pour assurer des chemins relatifs");
    return false;
  }
  
  log('OK', "La configuration de base (base: './') est définie correctement dans vite.config.ts");
  return true;
}

// Vérifie si index.html contient des chemins absolus
function checkForAbsolutePaths() {
  const indexPath = path.resolve('./dist/index.html');
  
  if (!fs.existsSync(indexPath)) {
    // Si dist/index.html n'existe pas, ne pas continuer la vérification
    return true;
  }
  
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  // Recherche des chemins absolus dans les attributs src et href
  const absolutePathsRegex = /(?:src|href)=["']\/[^"']+["']/g;
  const absolutePaths = content.match(absolutePathsRegex);
  
  if (absolutePaths && absolutePaths.length > 0) {
    log('ATTENTION', `${absolutePaths.length} chemins absolus détectés dans index.html:`);
    absolutePaths.forEach(path => {
      log('INFO', `- ${path}`);
    });
    return false;
  }
  
  log('OK', "Aucun chemin absolu détecté dans index.html");
  return true;
}

// Vérifie la présence du script Lovable dans index.html
function checkLovableScript() {
  const indexPath = path.resolve('./dist/index.html');
  
  if (!fs.existsSync(indexPath)) {
    return true;
  }
  
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  if (!content.includes('cdn.gpteng.co/gptengineer.js')) {
    log('ATTENTION', "Le script Lovable (gptengineer.js) est manquant dans index.html");
    return false;
  }
  
  log('OK', "Le script Lovable est présent dans index.html");
  return true;
}

// Fonction principale pour exécuter toutes les vérifications
function runAllChecks() {
  log('INFO', "Démarrage des vérifications pour le déploiement Netlify...");
  
  const checks = [
    checkFileExists('netlify.toml'),
    checkFileExists('_redirects', false),
    checkFileExists('_headers', false),
    checkViteConfig(),
    checkForAbsolutePaths(),
    checkLovableScript()
  ];
  
  const success = checks.every(check => check === true);
  
  if (success) {
    log('OK', "Toutes les vérifications sont passées avec succès!");
    return 0;
  } else {
    log('ATTENTION', "Certaines vérifications ont échoué. Veuillez consulter les messages ci-dessus.");
    return 1;
  }
}

// Exécuter les vérifications
const exitCode = runAllChecks();

// En cas d'erreur dans un environnement CI, sortir avec un code d'erreur
if (process.env.CI && exitCode !== 0) {
  process.exit(exitCode);
}
