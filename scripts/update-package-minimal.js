
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Lire le fichier package.json
let packageJson;
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('Erreur lors de la lecture du fichier package.json:', error);
  process.exit(1);
}

// Ajouter le script de version minimale s'il n'existe pas déjà
if (!packageJson.scripts.minimal) {
  packageJson.scripts.minimal = 'vite --config vite.minimal.config.ts';
}

// Écrire les modifications dans le fichier package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Script "minimal" ajouté avec succès au fichier package.json!');
} catch (error) {
  console.error('Erreur lors de l\'écriture dans le fichier package.json:', error);
  process.exit(1);
}
