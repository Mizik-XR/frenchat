
// Script pour s'assurer que le fichier _redirects est copié dans le dossier de build
const fs = require('fs');
const path = require('path');

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      const content = fs.readFileSync(source, 'utf8');
      
      // S'assurer que le répertoire de destination existe
      const dir = path.dirname(destination);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(destination, content);
      console.log(`✅ Fichier copié avec succès: ${source} -> ${destination}`);
      return true;
    } else {
      console.warn(`❌ Le fichier source n'existe pas: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la copie du fichier: ${error.message}`);
    return false;
  }
}

// Vérifier si le dossier dist existe
if (!fs.existsSync('dist')) {
  console.warn('⚠️ Le dossier dist n\'existe pas encore, ignoré.');
  process.exit(0);
}

// Copier le fichier _redirects dans le dossier dist
if (!copyFile('_redirects', 'dist/_redirects')) {
  // Si le fichier n'existe pas à la racine, le créer dans dist
  console.log('🔄 Création du fichier _redirects dans dist...');
  fs.writeFileSync('dist/_redirects', '/* /index.html 200\n');
  console.log('✅ Fichier _redirects créé dans dist.');
}

// Copier le fichier _headers dans le dossier dist si nécessaire
copyFile('scripts/_headers', 'dist/_headers') || 
copyFile('_headers', 'dist/_headers');

// Vérifier si index.html utilise des chemins absolus pour les assets
try {
  const indexPath = 'dist/index.html';
  if (fs.existsSync(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Vérifier si des chemins absolus sont présents
    if (htmlContent.includes('href="/assets') || htmlContent.includes('src="/assets')) {
      console.log('🔄 Conversion des chemins absolus en chemins relatifs dans index.html...');
      
      // Remplacer les chemins absolus par des chemins relatifs
      htmlContent = htmlContent.replace(/href="\/assets/g, 'href="./assets');
      htmlContent = htmlContent.replace(/src="\/assets/g, 'src="./assets');
      
      fs.writeFileSync(indexPath, htmlContent);
      console.log('✅ Chemins convertis avec succès dans index.html.');
    } else {
      console.log('✅ Aucun chemin absolu trouvé dans index.html, ignorer.');
    }
  }
} catch (error) {
  console.error(`❌ Erreur lors de la vérification des chemins d'accès: ${error.message}`);
}

console.log('✅ Vérification des fichiers de déploiement Netlify terminée.');
