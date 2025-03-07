
/**
 * Script de préparation pour le déploiement sur Netlify
 * Ce script vérifie et corrige les problèmes courants avant le déploiement
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration pour Netlify...');

// Fonction pour vérifier et créer un fichier s'il n'existe pas
function ensureFileExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    console.log(`📝 Création du fichier ${path.basename(filePath)}...`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Vérifier et créer _redirects
const redirectsPath = path.resolve('./_redirects');
ensureFileExists(redirectsPath, `# Redirection SPA - toutes les routes non existantes vers index.html avec code 200
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
`);

// Vérifier et créer _headers
const headersPath = path.resolve('./_headers');
ensureFileExists(headersPath, `# En-têtes globaux pour tous les fichiers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey, x-client-info, range
  Access-Control-Max-Age: 86400

# En-têtes pour les fichiers JavaScript
/*.js
  Content-Type: application/javascript; charset=utf-8

# En-têtes pour les fichiers JavaScript dans assets
/assets/*.js
  Content-Type: application/javascript; charset=utf-8

# En-têtes pour les fichiers CSS
/*.css
  Content-Type: text/css; charset=utf-8

# En-têtes pour les assets dans le dossier /assets/
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);

// Vérifier la configuration de base dans vite.config.ts
const viteConfigPath = path.resolve('./vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
  
  // Vérifier que base est défini à './'
  if (!viteConfig.includes("base: './'")) {
    console.log('⚠️ La propriété base de Vite n\'est pas définie à \'./\'');
    console.log('💡 Modifiez vite.config.ts pour inclure: base: \'./\'');
  } else {
    console.log('✅ La propriété base de Vite est correctement définie à \'./\'');
  }
}

// Si le build a été fait, vérifier les chemins dans index.html
const distIndexPath = path.resolve('./dist/index.html');
if (fs.existsSync(distIndexPath)) {
  const indexContent = fs.readFileSync(distIndexPath, 'utf-8');
  
  // Vérifier les chemins absolus
  const absolutePaths = (indexContent.match(/src="\/[^"]+"/g) || [])
    .concat(indexContent.match(/href="\/[^"]+"/g) || []);
  
  if (absolutePaths.length > 0) {
    console.log('⚠️ Chemins absolus détectés dans index.html:');
    absolutePaths.forEach(path => console.log(`   - ${path}`));
    console.log('💡 Ces chemins devraient être relatifs (./assets/...)');
  } else {
    console.log('✅ Aucun chemin absolu détecté dans index.html');
  }
  
  // Vérifier la présence du script Lovable
  if (!indexContent.includes('cdn.gpteng.co/gptengineer.js')) {
    console.log('⚠️ Script Lovable manquant dans index.html');
    console.log('💡 Ajoutez le script avant la fermeture de </body>');
  } else {
    console.log('✅ Script Lovable présent dans index.html');
  }
}

// Vérifier que les fichiers _redirects et _headers sont copiés dans dist
const distRedirectsPath = path.resolve('./dist/_redirects');
const distHeadersPath = path.resolve('./dist/_headers');

if (fs.existsSync('./dist')) {
  if (!fs.existsSync(distRedirectsPath)) {
    console.log('⚠️ _redirects n\'a pas été copié dans dist/');
    console.log('💡 Ajoutez une étape dans votre build pour copier _redirects');
    
    // Copier depuis la racine si possible
    if (fs.existsSync(redirectsPath)) {
      fs.copyFileSync(redirectsPath, distRedirectsPath);
      console.log('✅ _redirects a été copié dans dist/');
    }
  } else {
    console.log('✅ _redirects présent dans dist/');
  }
  
  if (!fs.existsSync(distHeadersPath)) {
    console.log('⚠️ _headers n\'a pas été copié dans dist/');
    console.log('💡 Ajoutez une étape dans votre build pour copier _headers');
    
    // Copier depuis la racine si possible
    if (fs.existsSync(headersPath)) {
      fs.copyFileSync(headersPath, distHeadersPath);
      console.log('✅ _headers a été copié dans dist/');
    }
  } else {
    console.log('✅ _headers présent dans dist/');
  }
}

console.log('✅ Vérification terminée');
