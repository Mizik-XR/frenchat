
#!/usr/bin/env node

/**
 * Script pour mettre à jour package.json avec des scripts pour Netlify
 */

const fs = require('fs');
const path = require('path');

try {
  // Lire le fichier package.json
  const packageJsonPath = path.resolve('./package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Scripts à ajouter ou mettre à jour
  const scriptsToUpdate = {
    "prepare-netlify": "node scripts/setup-netlify-deployment.js",
    "check-modules": "node scripts/check-module-compatibility.js",
    "netlify-build": "npm run build && node scripts/ensure-netlify-build.js"
  };
  
  // Mettre à jour les scripts
  packageJson.scripts = { ...packageJson.scripts, ...scriptsToUpdate };
  
  // Écrire les modifications dans package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Scripts Netlify ajoutés à package.json');
  console.log('Vous pouvez maintenant exécuter:');
  console.log('- npm run prepare-netlify: pour préparer le déploiement Netlify');
  console.log('- npm run check-modules: pour vérifier la compatibilité des modules');
  console.log('- npm run netlify-build: pour construire avec vérifications Netlify');
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour des scripts:', error);
  process.exit(1);
}
