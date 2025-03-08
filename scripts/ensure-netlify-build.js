
// Script pour assurer une configuration correcte de Netlify

import fs from 'fs';
import path from 'path';

// Fonction pour journaliser les messages avec des couleurs
const logInfo = (message) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`);
const logSuccess = (message) => console.log(`\x1b[32m[SUCCÈS]\x1b[0m ${message}`);
const logWarning = (message) => console.log(`\x1b[33m[ATTENTION]\x1b[0m ${message}`);
const logError = (message) => console.log(`\x1b[31m[ERREUR]\x1b[0m ${message}`);

// Journaliser un en-tête de script
console.log("\n\x1b[1m==============================================");
console.log("  VÉRIFICATION DE LA CONFIGURATION NETLIFY");
console.log("==============================================\x1b[0m\n");

let hasErrors = false;
let hasWarnings = false;
let hasAppliedFixes = false;

// Vérifier l'existence des fichiers nécessaires
logInfo("Vérification des fichiers de configuration...");

const requiredFiles = [
  { path: 'netlify.toml', critical: true },
  { path: '_redirects', critical: false },
  { path: '_headers', critical: false }
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file.path)) {
    if (file.critical) {
      logError(`Fichier critique manquant: ${file.path}`);
      hasErrors = true;
    } else {
      logWarning(`Fichier recommandé manquant: ${file.path}`);
      hasWarnings = true;
    }
  } else {
    logSuccess(`${file.path} présent.`);
  }
}

// Vérifier le contenu du fichier netlify.toml
if (fs.existsSync('netlify.toml')) {
  logInfo("Vérification du contenu de netlify.toml...");
  
  const netlifyToml = fs.readFileSync('netlify.toml', 'utf8');
  
  // Vérifier les configurations importantes
  if (!netlifyToml.includes('publish = "dist"')) {
    logError("La configuration 'publish = \"dist\"' est manquante dans netlify.toml");
    hasErrors = true;
  }
  
  if (!netlifyToml.includes('[build.environment]')) {
    logWarning("La section [build.environment] est manquante dans netlify.toml");
    hasWarnings = true;
  }
  
  if (!netlifyToml.includes('from = "/*"') || !netlifyToml.includes('to = "/index.html"')) {
    logWarning("La redirection SPA de base (/* -> /index.html) est manquante");
    hasWarnings = true;
  }
  
  // Vérifier et corriger la CSP pour les polices Google
  if (!netlifyToml.includes('https://fonts.googleapis.com') || !netlifyToml.includes('https://fonts.gstatic.com')) {
    logWarning("La CSP ne permet pas les polices Google (fonts.googleapis.com / fonts.gstatic.com)");
    hasWarnings = true;
    hasAppliedFixes = true;
    
    let fixedToml = netlifyToml.replace(
      /(Content-Security-Policy = ")([^"]+)(")/,
      (match, start, csp, end) => {
        // Ajouter fonts.googleapis.com à style-src si nécessaire
        if (!csp.includes('https://fonts.googleapis.com')) {
          csp = csp.replace(
            /(style-src 'self' 'unsafe-inline')([^;]*)(;|$)/,
            '$1 https://fonts.googleapis.com$2$3'
          );
        }
        
        // Ajouter fonts.gstatic.com à font-src si nécessaire
        if (!csp.includes('https://fonts.gstatic.com')) {
          csp = csp.replace(
            /(font-src 'self')([^;]*)(;|$)/,
            '$1 https://fonts.gstatic.com$2$3'
          );
        }
        
        return `${start}${csp}${end}`;
      }
    );
    
    fs.writeFileSync('netlify.toml', fixedToml, 'utf8');
    logSuccess("CSP mise à jour pour autoriser les polices Google");
  }
}

// Vérifier la configuration Vite
if (fs.existsSync('vite.config.ts') || fs.existsSync('vite.config.js')) {
  logInfo("Vérification de la configuration Vite...");
  
  const viteConfigPath = fs.existsSync('vite.config.ts') ? 'vite.config.ts' : 'vite.config.js';
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Vérifier la configuration de base
  if (!viteConfig.includes("base: './")) {
    logWarning("La configuration 'base: \"./\"' est recommandée pour les chemins relatifs");
    hasWarnings = true;
    
    // Tenter d'ajouter la configuration base
    if (!viteConfig.includes('base:')) {
      let fixedViteConfig = viteConfig;
      
      const defineConfigRegex = /defineConfig\(\s*\{/;
      if (defineConfigRegex.test(viteConfig)) {
        fixedViteConfig = viteConfig.replace(
          defineConfigRegex,
          "defineConfig({\n  base: './',"
        );
        
        fs.writeFileSync(viteConfigPath, fixedViteConfig, 'utf8');
        logSuccess("Configuration 'base: \"./\"' ajoutée à Vite");
        hasAppliedFixes = true;
      } else {
        logWarning("Impossible d'ajouter automatiquement la configuration 'base'. Veuillez l'ajouter manuellement");
      }
    }
  }
  
  // Vérifier les plugins pour s'assurer que les chemins sont relatifs
  if (!viteConfig.includes('ensureRelativePaths') && !viteConfig.includes('relative paths')) {
    logWarning("Aucun plugin pour assurer les chemins relatifs n'a été détecté");
    hasWarnings = true;
  }
}

// Résumé
console.log("\n\x1b[1m==============================================");
if (hasErrors) {
  console.log("\x1b[31m  ✘ La vérification a détecté des erreurs critiques");
  console.log("  Veuillez corriger ces problèmes avant de déployer\x1b[0m");
} else if (hasWarnings) {
  console.log("\x1b[33m  ⚠ La vérification a détecté des avertissements");
  console.log("  Votre déploiement pourrait rencontrer des problèmes\x1b[0m");
  
  if (hasAppliedFixes) {
    console.log("\x1b[32m  ✓ Certains problèmes ont été corrigés automatiquement\x1b[0m");
  }
} else {
  console.log("\x1b[32m  ✓ La configuration semble correcte pour Netlify");
  console.log("  Votre déploiement devrait fonctionner comme prévu\x1b[0m");
}
console.log("==============================================\n");

// Créer un fichier de journal pour référence
const logContent = `
RAPPORT DE VÉRIFICATION NETLIFY
Date: ${new Date().toISOString()}
Erreurs: ${hasErrors ? 'Oui' : 'Non'}
Avertissements: ${hasWarnings ? 'Oui' : 'Non'}
Corrections appliquées: ${hasAppliedFixes ? 'Oui' : 'Non'}
`;

fs.writeFileSync('netlify-check.log', logContent, 'utf8');
logInfo("Rapport enregistré dans netlify-check.log");

// Sortir avec le code approprié
if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}
