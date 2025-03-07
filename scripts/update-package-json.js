
// Script pour mettre à jour le package.json avant le déploiement Netlify
const fs = require('fs');
const path = require('path');

// Chemin vers le package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
  console.log(`[INFO] Lecture du fichier package.json à ${packageJsonPath}`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Vérifier si le script postbuild existe déjà
  if (!packageJson.scripts.postbuild || !packageJson.scripts.postbuild.includes('ensure-redirects.js')) {
    console.log('[INFO] Ajout du script postbuild...');
    // Ajouter ou modifier le script postbuild
    packageJson.scripts.postbuild = 'node scripts/ensure-redirects.js';
    
    // Écrire le package.json mis à jour
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json mis à jour avec succès.');
  } else {
    console.log('✅ Le script postbuild existe déjà dans package.json.');
  }
} catch (error) {
  console.error(`❌ Erreur lors de la mise à jour du package.json: ${error.message}`);
  process.exit(1);
}
