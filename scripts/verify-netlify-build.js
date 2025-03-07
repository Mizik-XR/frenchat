
const fs = require('fs');
const path = require('path');

console.log('Vérification de la compatibilité du build Netlify...');

// Vérifier si le répertoire dist existe
if (!fs.existsSync(path.resolve('./dist'))) {
  console.error('❌ Répertoire dist non trouvé. Exécutez npm run build d\'abord.');
  process.exit(1);
}

// Vérifier si index.html existe dans dist
const indexPath = path.resolve('./dist/index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html non trouvé.');
  process.exit(1);
}

// Lire le contenu de index.html
const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Vérifier les chemins absolus
const absolutePaths = indexContent.match(/(src|href)="\//g);
if (absolutePaths) {
  console.error('❌ Chemins absolus trouvés dans index.html:');
  console.error(absolutePaths);
  console.error('Les chemins doivent être relatifs (commençant par ./)');
} else {
  console.log('✅ Aucun chemin absolu trouvé dans index.html');
}

// Vérifier le script gptengineer.js
if (!indexContent.includes('cdn.gpteng.co/gptengineer.js')) {
  console.error('❌ Le script Lovable est absent dans index.html');
} else {
  console.log('✅ Le script Lovable est présent dans index.html');
}

// Vérifier le fichier _redirects
const redirectsPath = path.resolve('./dist/_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.error('❌ Fichier _redirects non trouvé dans dist');
} else {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
  if (!redirectsContent.includes('/* /index.html 200')) {
    console.error('❌ Le fichier _redirects ne contient pas la règle de redirection SPA');
  } else {
    console.log('✅ Le fichier _redirects contient la règle de redirection SPA correcte');
  }
}

// Vérifier le fichier _headers
const headersPath = path.resolve('./dist/_headers');
if (!fs.existsSync(headersPath)) {
  console.warn('⚠️ Fichier _headers non trouvé dans dist - il est optionnel mais recommandé');
} else {
  console.log('✅ Le fichier _headers est présent dans dist');
}

console.log('\nVérification terminée. Si tous les contrôles sont passés, votre build devrait être compatible avec le déploiement Netlify.');
