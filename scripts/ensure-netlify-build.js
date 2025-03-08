
/**
 * Script de vérification de la configuration Netlify
 * Vérifie et répare les problèmes courants dans les fichiers de configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Chemins des fichiers importants
const NETLIFY_TOML_PATH = path.join(process.cwd(), 'netlify.toml');
const HEADERS_PATH = path.join(process.cwd(), '_headers');
const REDIRECTS_PATH = path.join(process.cwd(), '_redirects');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

console.log('🔍 Vérification de la configuration Netlify...');

// S'assurer que le dossier de sauvegarde existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Variables pour suivre l'état de la vérification
let hasErrors = false;
let fixableErrors = false;

// Fonction pour créer une copie de sauvegarde
function createBackup(filePath) {
  if (fs.existsSync(filePath)) {
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, `${fileName}.bak-${Date.now()}`);
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

// 1. Vérifier netlify.toml
console.log('\n📄 Vérification de netlify.toml');
if (!fs.existsSync(NETLIFY_TOML_PATH)) {
  console.error('❌ ERREUR: netlify.toml est introuvable!');
  hasErrors = true;
  fixableErrors = true;
} else {
  // Lire le contenu de netlify.toml
  const netlifyToml = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');
  
  // Vérifier les paramètres essentiels
  let netlifyTomlFixed = false;
  let updatedToml = netlifyToml;
  
  // Vérifier la directive publish
  if (!netlifyToml.includes('[build]') || !netlifyToml.includes('publish = "dist"')) {
    console.warn('⚠️ Warning: Configuration [build] manquante ou incorrecte dans netlify.toml');
    updatedToml = updatedToml.replace(/\[build\][^\[]*/, '');
    updatedToml = '[build]\n  publish = "dist"\n  command = "npm run build"\n' + updatedToml;
    netlifyTomlFixed = true;
  }
  
  // Vérifier la configuration des en-têtes pour les polices et les styles
  if (!netlifyToml.includes('font-src') || !netlifyToml.includes('fonts.gstatic.com')) {
    console.warn('⚠️ Warning: En-têtes CSP manquants ou incorrects pour les polices dans netlify.toml');
    
    // Remplacer ou ajouter la politique CSP
    const cspPattern = /Content-Security-Policy = "[^"]+"/;
    const correctCsp = 'Content-Security-Policy = "default-src \'self\'; connect-src \'self\' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://cdn.gpteng.co; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: blob: https:; worker-src \'self\' blob:; font-src \'self\' https: data:;"';
    
    if (cspPattern.test(updatedToml)) {
      updatedToml = updatedToml.replace(cspPattern, correctCsp);
    } else {
      // Si aucune politique CSP n'existe, l'ajouter dans la section [[headers]]
      if (!updatedToml.includes('[[headers]]')) {
        updatedToml += '\n# En-têtes pour tous les fichiers\n[[headers]]\n  for = "/*"\n  [headers.values]\n    ' + correctCsp + '\n';
      } else {
        // Trouver la section [headers.values] et y ajouter la CSP
        const headerPattern = /\[\[headers\]\]\s+for = "\/\*"\s+\[headers\.values\]/;
        if (headerPattern.test(updatedToml)) {
          const headerSection = updatedToml.match(headerPattern)[0];
          updatedToml = updatedToml.replace(headerSection, headerSection + '\n    ' + correctCsp);
        }
      }
    }
    netlifyTomlFixed = true;
  }
  
  // Appliquer les corrections si nécessaire
  if (netlifyTomlFixed) {
    const backupPath = createBackup(NETLIFY_TOML_PATH);
    console.log(`📋 Sauvegarde de netlify.toml créée: ${backupPath}`);
    fs.writeFileSync(NETLIFY_TOML_PATH, updatedToml);
    console.log('✅ netlify.toml a été corrigé');
    fixableErrors = true;
  } else {
    console.log('✅ netlify.toml semble correctement configuré');
  }
}

// 2. Vérifier _headers
console.log('\n📄 Vérification de _headers');
if (!fs.existsSync(HEADERS_PATH)) {
  console.warn('⚠️ Warning: _headers est introuvable, création du fichier...');
  
  // Créer un fichier _headers avec une configuration de base
  const headersContent = `# En-têtes globaux pour tous les fichiers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey, x-client-info, range
  Access-Control-Max-Age: 86400
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;

# En-têtes pour les fichiers JavaScript
/*.js
  Content-Type: application/javascript; charset=utf-8

# En-têtes pour les fichiers CSS
/*.css
  Content-Type: text/css; charset=utf-8

# En-têtes pour les assets dans le dossier /assets/
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# En-têtes pour les polices
/*.woff
  Content-Type: font/woff
/*.woff2
  Content-Type: font/woff2
/*.ttf
  Content-Type: font/ttf
/*.eot
  Content-Type: application/vnd.ms-fontobject
`;
  
  fs.writeFileSync(HEADERS_PATH, headersContent);
  console.log('✅ Fichier _headers créé avec succès');
  fixableErrors = true;
} else {
  // Vérifier et corriger le contenu du fichier _headers
  const headersContent = fs.readFileSync(HEADERS_PATH, 'utf8');
  let headersUpdated = false;
  let updatedHeaders = headersContent;
  
  // Vérifier la présence d'en-têtes CSP pour les polices
  if (!headersContent.includes('font-src') || !headersContent.includes('fonts.gstatic.com')) {
    console.warn('⚠️ Warning: En-têtes CSP manquants ou incorrects pour les polices dans _headers');
    
    // Corriger ou ajouter la politique CSP
    const cspPattern = /Content-Security-Policy: [^\n]*/;
    const correctCsp = 'Content-Security-Policy: default-src \'self\'; connect-src \'self\' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://cdn.gpteng.co; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: blob: https:; worker-src \'self\' blob:; font-src \'self\' https: data:;';
    
    if (cspPattern.test(updatedHeaders)) {
      updatedHeaders = updatedHeaders.replace(cspPattern, correctCsp);
    } else {
      // Si aucune politique CSP n'existe, l'ajouter dans la section pour /*
      const globalHeaderPattern = /\/\*\s+[^\n]*/;
      if (globalHeaderPattern.test(updatedHeaders)) {
        const globalHeaderSection = updatedHeaders.match(globalHeaderPattern)[0];
        updatedHeaders = updatedHeaders.replace(globalHeaderSection, globalHeaderSection + '\n  ' + correctCsp);
      } else {
        // Créer une nouvelle section globale si elle n'existe pas
        updatedHeaders = `# En-têtes globaux pour tous les fichiers\n/*\n  ${correctCsp}\n` + updatedHeaders;
      }
    }
    headersUpdated = true;
  }
  
  // Appliquer les corrections si nécessaire
  if (headersUpdated) {
    const backupPath = createBackup(HEADERS_PATH);
    console.log(`📋 Sauvegarde de _headers créée: ${backupPath}`);
    fs.writeFileSync(HEADERS_PATH, updatedHeaders);
    console.log('✅ _headers a été corrigé');
    fixableErrors = true;
  } else {
    console.log('✅ _headers semble correctement configuré');
  }
}

// 3. Vérifier _redirects
console.log('\n📄 Vérification de _redirects');
if (!fs.existsSync(REDIRECTS_PATH)) {
  console.warn('⚠️ Warning: _redirects est introuvable, création du fichier...');
  
  // Créer un fichier _redirects avec une configuration de base
  const redirectsContent = `/*  /index.html  200 
`;
  
  fs.writeFileSync(REDIRECTS_PATH, redirectsContent);
  console.log('✅ Fichier _redirects créé avec succès');
  fixableErrors = true;
} else {
  // Vérifier le contenu du fichier _redirects
  const redirectsContent = fs.readFileSync(REDIRECTS_PATH, 'utf8');
  
  if (!redirectsContent.includes('/index.html')) {
    console.warn('⚠️ Warning: Règle de redirection SPA manquante dans _redirects');
    
    // Créer une sauvegarde
    const backupPath = createBackup(REDIRECTS_PATH);
    console.log(`📋 Sauvegarde de _redirects créée: ${backupPath}`);
    
    // Ajouter la règle de redirection SPA
    const updatedRedirects = redirectsContent + '\n/*  /index.html  200\n';
    fs.writeFileSync(REDIRECTS_PATH, updatedRedirects);
    console.log('✅ _redirects a été corrigé');
    fixableErrors = true;
  } else {
    console.log('✅ _redirects semble correctement configuré');
  }
}

// Résumé de la vérification
console.log('\n🔍 Résumé de la vérification Netlify:');
if (hasErrors) {
  console.log('❌ Des erreurs critiques ont été détectées.');
  if (fixableErrors) {
    console.log('🔧 Certaines erreurs ont été corrigées automatiquement.');
  }
  process.exit(1);
} else if (fixableErrors) {
  console.log('✅ Des problèmes mineurs ont été détectés et corrigés.');
  process.exit(0);
} else {
  console.log('✅ Tous les fichiers de configuration Netlify sont corrects.');
  process.exit(0);
}
