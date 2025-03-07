
// Script pour s'assurer que le fichier _redirects est copié dans le dossier dist
const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const sourceRedirectsPath = path.join(__dirname, '..', '_redirects');
const targetRedirectsPath = path.join(__dirname, '..', 'dist', '_redirects');
const sourceHeadersPath = path.join(__dirname, '_headers');
const targetHeadersPath = path.join(__dirname, '..', 'dist', '_headers');

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      console.log(`[INFO] Copie de ${source} vers ${destination}`);
      fs.copyFileSync(source, destination);
      console.log(`[OK] ${path.basename(source)} copié avec succès.`);
      return true;
    } else {
      console.log(`[ATTENTION] ${source} n'existe pas.`);
      return false;
    }
  } catch (error) {
    console.error(`[ERREUR] Échec de la copie de ${source}: ${error.message}`);
    return false;
  }
}

// S'assurer que le dossier dist existe
if (!fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  console.error('[ERREUR] Le dossier dist n\'existe pas. Le build a-t-il échoué?');
  process.exit(1);
}

// Copier _redirects si nécessaire
if (!copyFile(sourceRedirectsPath, targetRedirectsPath)) {
  // Si le fichier source n'existe pas, le créer
  if (!fs.existsSync(sourceRedirectsPath)) {
    console.log('[INFO] Création du fichier _redirects à la racine...');
    fs.writeFileSync(sourceRedirectsPath, '/* /index.html 200\n');
    copyFile(sourceRedirectsPath, targetRedirectsPath);
  }
}

// Copier _headers si nécessaire
copyFile(sourceHeadersPath, targetHeadersPath);

console.log('[INFO] Vérification des fichiers de déploiement terminée.');
