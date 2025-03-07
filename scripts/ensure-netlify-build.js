
/**
 * Script de vérification de configuration pour Netlify
 * Ce script vérifie que la configuration est correcte pour un déploiement Netlify
 */

const fs = require('fs');
const path = require('path');

// Configuration de base
const requiredFiles = {
  'vite.config.ts': 'Configuration de Vite',
  'index.html': 'Page d\'accueil',
  '_redirects': 'Règles de redirection Netlify',
};

// Variables pour le suivi des erreurs
let errors = 0;
let warnings = 0;

// Fonction d'aide pour le logging
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    warning: '\x1b[33m', // Jaune
    error: '\x1b[31m', // Rouge
    success: '\x1b[32m', // Vert
    reset: '\x1b[0m'  // Réinitialiser
  };

  const prefix = {
    info: '[INFO]',
    warning: '[AVERTISSEMENT]',
    error: '[ERREUR]',
    success: '[OK]'
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
  
  if (type === 'error') errors++;
  if (type === 'warning') warnings++;
}

// Fonction principale de vérification
async function checkNetlifyConfiguration() {
  console.log('=== Vérification de la configuration Netlify ===');
  
  // 1. Vérification des fichiers requis
  log('Vérification des fichiers requis...');
  Object.entries(requiredFiles).forEach(([file, description]) => {
    if (!fs.existsSync(file)) {
      log(`Fichier manquant: ${file} (${description})`, 'error');
    } else {
      log(`Fichier trouvé: ${file} (${description})`, 'success');
    }
  });
  
  // 2. Vérification de vite.config.ts pour base: './'
  if (fs.existsSync('vite.config.ts')) {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf-8');
    if (!viteConfig.includes("base: './'")) {
      log("La configuration 'base: \"./\"' est manquante dans vite.config.ts. Ceci est nécessaire pour les chemins relatifs.", 'warning');
    } else {
      log("Configuration 'base' correcte dans vite.config.ts", 'success');
    }
  }
  
  // 3. Vérification du contenu de _redirects
  if (fs.existsSync('_redirects')) {
    const redirects = fs.readFileSync('_redirects', 'utf-8');
    if (!redirects.includes('/* /index.html 200')) {
      log("La règle '/* /index.html 200' est manquante dans _redirects", 'warning');
    } else {
      log("Règle de redirection SPA correctement configurée", 'success');
    }
  }
  
  // 4. Vérification de netlify.toml
  if (fs.existsSync('netlify.toml')) {
    log("netlify.toml présent, vérification des paramètres...");
    const netlifyToml = fs.readFileSync('netlify.toml', 'utf-8');
    
    if (!netlifyToml.includes('[build]')) {
      log("La section [build] est manquante dans netlify.toml", 'warning');
    }
    
    if (!netlifyToml.includes('publish = "dist"')) {
      log("'publish = \"dist\"' est manquant dans netlify.toml", 'warning');
    }
  } else {
    log("Fichier netlify.toml non trouvé. Recommandé pour les configurations avancées.", 'info');
  }
  
  // 5. Vérification de package.json
  if (fs.existsSync('package.json')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      
      if (!packageJson.scripts || !packageJson.scripts.build) {
        log("Script de build manquant dans package.json", 'error');
      } else {
        log("Script de build correctement configuré", 'success');
      }
      
      // Vérification des dépendances critiques
      const criticalDeps = ['vite', 'react', 'react-dom'];
      criticalDeps.forEach(dep => {
        if (
          (!packageJson.dependencies || !packageJson.dependencies[dep]) && 
          (!packageJson.devDependencies || !packageJson.devDependencies[dep])
        ) {
          log(`Dépendance critique manquante: ${dep}`, 'warning');
        }
      });
      
    } catch (err) {
      log(`Erreur lors de l'analyse de package.json: ${err.message}`, 'error');
    }
  }
  
  // Résumé final
  console.log('\n=== Résultat de la vérification ===');
  if (errors > 0) {
    log(`${errors} erreur(s) trouvée(s). Le déploiement pourrait échouer.`, 'error');
  } else if (warnings > 0) {
    log(`${warnings} avertissement(s) trouvé(s). Le déploiement devrait fonctionner, mais des améliorations sont possibles.`, 'warning');
  } else {
    log("Aucun problème détecté. La configuration semble correcte!", 'success');
  }
  
  // Retourner un code d'erreur si des erreurs ont été trouvées
  process.exit(errors > 0 ? 1 : 0);
}

// Exécuter la vérification
checkNetlifyConfiguration().catch(err => {
  log(`Erreur lors de la vérification: ${err.message}`, 'error');
  process.exit(1);
});
