
#!/usr/bin/env node

/**
 * Script de pré-build pour Netlify - contourne les problèmes d'installation de dépendances
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=================================================');
console.log('    PRÉPARATION NETLIFY - FILECHAT');
console.log('=================================================');
console.log('');

// Vérifier si nous sommes sur Netlify
const isNetlify = process.env.NETLIFY === 'true';
console.log(`Environnement Netlify: ${isNetlify ? 'Oui' : 'Non'}`);

// Définir les variables d'environnement
process.env.NO_RUST_INSTALL = '1';
process.env.TRANSFORMERS_OFFLINE = '1';
process.env.SKIP_PYTHON_INSTALLATION = 'true';
process.env.VITE_CLOUD_MODE = 'true';
process.env.VITE_ALLOW_LOCAL_AI = 'false';
process.env.NETLIFY_SKIP_PYTHON_REQUIREMENTS = 'true';

console.log('Variables d\'environnement définies:');
console.log('NO_RUST_INSTALL:', process.env.NO_RUST_INSTALL);
console.log('TRANSFORMERS_OFFLINE:', process.env.TRANSFORMERS_OFFLINE);
console.log('SKIP_PYTHON_INSTALLATION:', process.env.SKIP_PYTHON_INSTALLATION);
console.log('NETLIFY_SKIP_PYTHON_REQUIREMENTS:', process.env.NETLIFY_SKIP_PYTHON_REQUIREMENTS);
console.log('');

// Créer un fichier .env.production si nécessaire
if (!fs.existsSync('.env.production') || isNetlify) {
  console.log('Création du fichier .env.production pour le déploiement...');
  const envContent = `
VITE_API_URL=/.netlify/functions
VITE_ENVIRONMENT=production
VITE_SITE_URL=${process.env.URL || 'https://filechat-app.netlify.app'}
VITE_ALLOW_LOCAL_AI=false
VITE_SKIP_PYTHON_INSTALLATION=true
VITE_CLOUD_MODE=true
  `.trim();
  
  fs.writeFileSync('.env.production', envContent);
  console.log('[OK] Fichier .env.production créé.');
}

// Modifier le fichier requirements.txt pour contourner les dépendances Rust
if (fs.existsSync('requirements.txt')) {
  console.log('Création d\'un requirements.txt minimal pour Netlify...');
  const minimalRequirements = `
# Dépendances principales - Version simplifiée pour Netlify
fastapi==0.110.0
uvicorn==0.28.0
pydantic>=2.0.0
aiohttp>=3.8.0
psutil==5.9.8

# Note: Les packages nécessitant Rust sont commentés pour le déploiement Netlify
# tokenizers==0.15.2
# transformers==4.36.2
# accelerate==0.28.0
# datasets==2.18.0
# bitsandbytes==0.41.1;platform_system!="Windows"
# bitsandbytes-windows==0.41.1;platform_system=="Windows"
`.trim();

  fs.writeFileSync('requirements.txt', minimalRequirements);
  console.log('[OK] Fichier requirements.txt simplifié.');
}

console.log('');
console.log('=================================================');
console.log('    PRÉPARATION TERMINÉE');
console.log('=================================================');
