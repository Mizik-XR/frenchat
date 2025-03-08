
// Script pour vérifier et assurer que la configuration Netlify est correcte
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

console.log("Vérification de la configuration pour le déploiement Netlify...");

// Chemins des fichiers importants
const rootDir = process.cwd();
const netlifyTomlPath = join(rootDir, 'netlify.toml');
const headersPath = join(rootDir, '_headers');
const redirectsPath = join(rootDir, '_redirects');
const distDir = join(rootDir, 'dist');
const distHeadersPath = join(distDir, '_headers');
const distRedirectsPath = join(distDir, '_redirects');

// Vérification de netlify.toml
let needsFix = false;

if (!existsSync(netlifyTomlPath)) {
  console.error("❌ Fichier netlify.toml manquant à la racine du projet!");
  console.log("📝 Création du fichier netlify.toml depuis le modèle...");
  
  // Essayer d'utiliser le modèle dans le dossier scripts
  const templatePath = join(rootDir, 'scripts', 'netlify.toml');
  if (existsSync(templatePath)) {
    const templateContent = readFileSync(templatePath, 'utf8');
    writeFileSync(netlifyTomlPath, templateContent, 'utf8');
    console.log("✅ netlify.toml créé avec succès à partir du modèle.");
  } else {
    // Créer un fichier netlify.toml de base
    const basicConfig = `# Configuration de build Netlify pour FileChat
[build]
  publish = "dist"
  command = "npm run build"

# Configuration des variables d'environnement par défaut
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefer-offline --no-audit --no-fund"
  NODE_OPTIONS = "--max-old-space-size=4096"
  NO_RUST_INSTALL = "1"
  NETLIFY_USE_YARN = "false"
  TRANSFORMERS_OFFLINE = "1"
  CI = "true"
  SKIP_PYTHON_INSTALLATION = "true"
  NETLIFY_SKIP_PYTHON_REQUIREMENTS = "true"
  VITE_CLOUD_MODE = "true"
  VITE_ALLOW_LOCAL_AI = "false"

# Configuration des redirections pour le routage SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
  
# Rediriger les API vers les fonctions Netlify
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Configuration des fonctions Netlify
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = ["**/*.model"]
  external_node_modules = ["@supabase/supabase-js"]

# En-têtes pour tous les fichiers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;"
`;
    writeFileSync(netlifyTomlPath, basicConfig, 'utf8');
    console.log("✅ Fichier netlify.toml de base créé avec succès.");
  }
  needsFix = true;
} else {
  console.log("✅ Le fichier netlify.toml existe.");

  // Vérifier le contenu du fichier netlify.toml
  let netlifyContent = readFileSync(netlifyTomlPath, 'utf8');
  
  // Vérifier si la configuration CSP inclut fonts.googleapis.com et fonts.gstatic.com
  if (!netlifyContent.includes('fonts.googleapis.com') || !netlifyContent.includes('fonts.gstatic.com')) {
    console.log("⚠️ La configuration CSP dans netlify.toml ne permet pas Google Fonts.");
    console.log("📝 Mise à jour de la configuration CSP...");
    
    // Mise à jour de la CSP pour inclure Google Fonts
    netlifyContent = netlifyContent.replace(
      /Content-Security-Policy = "[^"]*"/g,
      'Content-Security-Policy = "default-src \'self\'; connect-src \'self\' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://cdn.gpteng.co; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: blob: https:; worker-src \'self\' blob:; font-src \'self\' https: data:;"'
    );
    
    writeFileSync(netlifyTomlPath, netlifyContent, 'utf8');
    console.log("✅ Configuration CSP mise à jour pour permettre Google Fonts.");
    needsFix = true;
  }
}

// Vérification du fichier _headers
if (!existsSync(headersPath)) {
  console.log("⚠️ Fichier _headers manquant à la racine du projet.");
  console.log("📝 Création du fichier _headers...");
  
  const basicHeaders = `# En-têtes globaux pour tous les fichiers
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
  
  writeFileSync(headersPath, basicHeaders, 'utf8');
  console.log("✅ Fichier _headers créé avec succès.");
  needsFix = true;
} else {
  console.log("✅ Le fichier _headers existe.");
  
  // Vérifier le contenu du fichier _headers
  let headersContent = readFileSync(headersPath, 'utf8');
  
  // Vérifier si la configuration inclut Google Fonts
  if (!headersContent.includes('fonts.googleapis.com') || !headersContent.includes('fonts.gstatic.com')) {
    console.log("⚠️ La configuration CSP dans _headers ne permet pas Google Fonts.");
    console.log("📝 Mise à jour de la configuration CSP dans _headers...");
    
    // Mise à jour de la CSP pour inclure Google Fonts
    headersContent = headersContent.replace(
      /Content-Security-Policy: [^\n]*/g,
      'Content-Security-Policy: default-src \'self\'; connect-src \'self\' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://cdn.gpteng.co; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: blob: https:; worker-src \'self\' blob:; font-src \'self\' https: data:;'
    );
    
    writeFileSync(headersPath, headersContent, 'utf8');
    console.log("✅ Configuration CSP dans _headers mise à jour pour permettre Google Fonts.");
    needsFix = true;
  }
}

// Vérification du fichier _redirects
if (!existsSync(redirectsPath)) {
  console.log("⚠️ Fichier _redirects manquant à la racine du projet.");
  console.log("📝 Création du fichier _redirects...");
  
  const basicRedirects = `# Redirection SPA - toutes les routes non existantes vers index.html
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
`;
  
  writeFileSync(redirectsPath, basicRedirects, 'utf8');
  console.log("✅ Fichier _redirects créé avec succès.");
  needsFix = true;
} else {
  console.log("✅ Le fichier _redirects existe.");
}

// Vérifier si les fichiers _headers et _redirects sont dans dist (si dist existe)
if (existsSync(distDir)) {
  console.log("🔍 Vérification des fichiers dans le dossier dist...");
  
  // Vérifier _headers dans dist
  if (!existsSync(distHeadersPath)) {
    console.log("⚠️ Fichier _headers manquant dans le dossier dist.");
    console.log("📝 Copie du fichier _headers vers dist...");
    
    writeFileSync(distHeadersPath, readFileSync(headersPath, 'utf8'), 'utf8');
    console.log("✅ Fichier _headers copié vers dist.");
    needsFix = true;
  }
  
  // Vérifier _redirects dans dist
  if (!existsSync(distRedirectsPath)) {
    console.log("⚠️ Fichier _redirects manquant dans le dossier dist.");
    console.log("📝 Copie du fichier _redirects vers dist...");
    
    writeFileSync(distRedirectsPath, readFileSync(redirectsPath, 'utf8'), 'utf8');
    console.log("✅ Fichier _redirects copié vers dist.");
    needsFix = true;
  }
}

// Résumé final
if (needsFix) {
  console.log("\n⚠️ Des problèmes ont été détectés et corrigés dans la configuration Netlify.");
  console.log("✅ La configuration a été mise à jour pour un déploiement optimal sur Netlify.");
  process.exit(1); // Code d'erreur pour signaler qu'il y a eu des corrections
} else {
  console.log("\n✅ La configuration Netlify est correcte et prête pour le déploiement!");
  process.exit(0); // Code de succès
}
