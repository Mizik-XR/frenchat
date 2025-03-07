
// Script pour copier _redirects et _headers dans le dossier de build
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const files = ['_redirects', '_headers'];

// Vérifier si le dossier dist existe
if (!fs.existsSync(dist)) {
  console.error(`❌ Le dossier de build 'dist' n'existe pas`);
  process.exit(1);
}

// Copier les fichiers
files.forEach(file => {
  const source = path.join(__dirname, '..', file);
  const destination = path.join(dist, file);
  
  // Vérifier si le fichier source existe
  if (fs.existsSync(source)) {
    try {
      fs.copyFileSync(source, destination);
      console.log(`✅ Fichier ${file} copié vers ${destination}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la copie de ${file}: ${error.message}`);
    }
  } else {
    // Si le fichier source n'existe pas, vérifier s'il peut être créé depuis scripts/
    const scriptSource = path.join(__dirname, file);
    if (fs.existsSync(scriptSource)) {
      try {
        // Copier depuis le dossier scripts vers dist
        fs.copyFileSync(scriptSource, destination);
        // Copier aussi vers la racine pour les builds futurs
        fs.copyFileSync(scriptSource, path.join(__dirname, '..', file));
        console.log(`✅ Fichier ${file} copié depuis scripts/ vers ${destination} et la racine`);
      } catch (error) {
        console.error(`❌ Erreur lors de la copie de ${file} depuis scripts/: ${error.message}`);
      }
    } else {
      console.error(`❌ Fichier ${file} introuvable`);
      // Si c'est _redirects qui manque, créer un fichier par défaut
      if (file === '_redirects') {
        try {
          fs.writeFileSync(destination, '/* /index.html 200\n');
          fs.writeFileSync(path.join(__dirname, '..', file), '/* /index.html 200\n');
          console.log(`✅ Fichier ${file} créé par défaut`);
        } catch (error) {
          console.error(`❌ Erreur lors de la création de ${file}: ${error.message}`);
        }
      }
    }
  }
});

console.log('✅ Vérification des fichiers de déploiement terminée');
