
/**
 * Script de pré-build pour Netlify - contourne les problèmes d'installation de dépendances
 * Python et Rust sur Netlify en configurant les variables d'environnement nécessaires.
 */

console.log('=== NETLIFY PRE-BUILD SCRIPT ===');
console.log('Préparation de l\'environnement pour le build...');

// Définir les variables d'environnement critiques pour Netlify
process.env.NO_RUST_INSTALL = '1';
process.env.TRANSFORMERS_OFFLINE = '1';
process.env.SKIP_PYTHON_INSTALLATION = 'true';
process.env.NETLIFY_SKIP_PYTHON_REQUIREMENTS = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Configurer le mode cloud
process.env.VITE_CLOUD_MODE = 'true';
process.env.VITE_ALLOW_LOCAL_AI = 'false';

const fs = require('fs');
const path = require('path');

// Créer/mettre à jour le fichier .env.production si nécessaire
try {
  const envPath = path.resolve(process.cwd(), '.env.production');
  if (!fs.existsSync(envPath)) {
    console.log('Création du fichier .env.production...');
    
    const envContent = `
VITE_API_URL=/.netlify/functions
VITE_ENVIRONMENT=production
VITE_SITE_URL=${process.env.URL || 'https://filechat-app.netlify.app'}
VITE_ALLOW_LOCAL_AI=false
VITE_SKIP_PYTHON_INSTALLATION=true
VITE_CLOUD_MODE=true
`;
    
    fs.writeFileSync(envPath, envContent.trim());
    console.log('Fichier .env.production créé avec succès.');
  }
} catch (error) {
  console.error('Erreur lors de la création du fichier .env.production:', error);
}

// Vérification de requirements.txt pour Netlify
try {
  const reqPath = path.resolve(process.cwd(), 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    console.log('Simplification du fichier requirements.txt pour Netlify...');
    
    const simplifiedRequirements = `
# Version simplifiée pour Netlify (sans compilation Rust)
fastapi==0.110.0
uvicorn==0.28.0
pydantic>=2.0.0
aiohttp>=3.8.0
`;
    
    fs.writeFileSync(reqPath, simplifiedRequirements.trim());
    console.log('Fichier requirements.txt simplifié pour Netlify.');
  }
} catch (error) {
  console.error('Erreur lors de la modification de requirements.txt:', error);
}

console.log('Configuration terminée pour le build Netlify.');
console.log('========================================');
