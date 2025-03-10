
/**
 * Script de préparation pour le déploiement Netlify
 * Ce script exécute les étapes nécessaires avant le build sur Netlify
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== PRÉPARATION DU DÉPLOIEMENT NETLIFY ===');

// Vérifier l'environnement
const isNetlify = process.env.NETLIFY === 'true';
console.log(`[INFO] Environnement Netlify: ${isNetlify ? 'Oui' : 'Non'}`);

// Configurer les variables d'environnement pour le build
process.env.NO_RUST_INSTALL = '1';
process.env.TRANSFORMERS_OFFLINE = '1';
process.env.SKIP_PYTHON_INSTALLATION = 'true';
process.env.NETLIFY_SKIP_PYTHON_REQUIREMENTS = 'true';
process.env.NODE_ENV = 'production';
process.env.VITE_CLOUD_MODE = 'true';
process.env.VITE_ALLOW_LOCAL_AI = 'false';

console.log('[INFO] Variables d\'environnement configurées pour le déploiement');

// Vérifier si le fichier requirements.txt existe et le simplifier pour Netlify
try {
  if (fs.existsSync('requirements.txt')) {
    console.log('[INFO] Simplification du fichier requirements.txt pour Netlify...');
    
    // Créer une version simplifiée sans les dépendances nécessitant Rust
    const minimalRequirements = `
# Version simplifiée pour Netlify (sans compilation Rust)
fastapi==0.110.0
uvicorn==0.28.0
pydantic>=2.0.0
aiohttp>=3.8.0
# Les packages qui nécessitent Rust sont commentés
# tokenizers
# transformers
    `.trim();
    
    fs.writeFileSync('requirements.txt', minimalRequirements);
    console.log('[OK] Fichier requirements.txt simplifié créé');
  }
} catch (error) {
  console.error('[ERREUR] Problème lors de la modification du fichier requirements.txt:', error.message);
}

// Vérifier et créer le fichier _redirects si nécessaire
try {
  const redirectsContent = `
# Redirection pour toutes les routes vers index.html (SPA)
/* /index.html 200

# Assurer que / est accessible directement
/ /index.html 200 

# Redirection des API vers les fonctions Netlify
/api/* /.netlify/functions/:splat 200
  `.trim();
  
  fs.writeFileSync('_redirects', redirectsContent);
  console.log('[OK] Fichier _redirects créé/mis à jour');
} catch (error) {
  console.error('[ERREUR] Problème lors de la création du fichier _redirects:', error.message);
}

console.log('[INFO] Préparation terminée, prêt pour le build');
