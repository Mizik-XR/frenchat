
// Script de vérification et correction de la configuration Netlify
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Fichiers à vérifier
const netlifyTomlPath = path.join(rootDir, 'netlify.toml');
const headersPath = path.join(rootDir, '_headers');
const redirectsPath = path.join(rootDir, '_redirects');

console.log('[INFO] Vérification de la configuration Netlify...');

let hasErrors = false;

// Vérifier si netlify.toml existe
if (!fs.existsSync(netlifyTomlPath)) {
  console.log('[ERREUR] Fichier netlify.toml manquant');
  
  // Copier depuis le fichier modèle s'il existe
  const templatePath = path.join(__dirname, 'netlify.toml');
  if (fs.existsSync(templatePath)) {
    console.log('[INFO] Copie du fichier netlify.toml depuis le modèle');
    fs.copyFileSync(templatePath, netlifyTomlPath);
    console.log('[OK] Fichier netlify.toml créé');
  } else {
    console.log('[AVERTISSEMENT] Aucun modèle de netlify.toml trouvé');
    hasErrors = true;
  }
} else {
  console.log('[OK] Fichier netlify.toml trouvé');
  
  // Vérifier le contenu de netlify.toml
  const netlifyContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // Vérifier que les redirections sont configurées
  if (!netlifyContent.includes('[[redirects]]')) {
    console.log('[ERREUR] Configuration des redirections manquante dans netlify.toml');
    hasErrors = true;
  }
  
  // Vérifier la configuration CSP pour Google Fonts
  if (!netlifyContent.includes('fonts.googleapis.com') || !netlifyContent.includes('fonts.gstatic.com')) {
    console.log('[ERREUR] Configuration CSP pour Google Fonts manquante dans netlify.toml');
    console.log('[INFO] Ajout des domaines Google Fonts à la CSP...');
    
    // Mise à jour de la CSP pour inclure Google Fonts
    let updatedContent = netlifyContent.replace(
      /(Content-Security-Policy = ")([^"]*)(")/, 
      '$1$2 https://fonts.googleapis.com https://fonts.gstatic.com$3'
    );
    
    // Si pas de changement, c'est que le pattern n'a pas été trouvé
    if (updatedContent === netlifyContent) {
      console.log('[ERREUR] Impossible de mettre à jour automatiquement la CSP');
      hasErrors = true;
    } else {
      fs.writeFileSync(netlifyTomlPath, updatedContent);
      console.log('[OK] CSP mise à jour pour inclure Google Fonts');
    }
  }
}

// Vérifier si _headers existe
if (!fs.existsSync(headersPath)) {
  console.log('[INFO] Fichier _headers manquant, création...');
  
  // Copier depuis le fichier modèle s'il existe
  const templatePath = path.join(__dirname, '_headers');
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, headersPath);
    console.log('[OK] Fichier _headers créé depuis le modèle');
  } else {
    // Créer un fichier _headers minimal
    const headersContent = `# En-têtes globaux pour tous les fichiers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;
`;
    fs.writeFileSync(headersPath, headersContent);
    console.log('[OK] Fichier _headers créé avec une configuration de base');
  }
}

// Vérifier si _redirects existe
if (!fs.existsSync(redirectsPath)) {
  console.log('[INFO] Fichier _redirects manquant, création...');
  fs.writeFileSync(redirectsPath, '/* /index.html 200\n');
  console.log('[OK] Fichier _redirects créé');
}

// Informer l'utilisateur du résultat
if (hasErrors) {
  console.log('\n[ATTENTION] Des problèmes ont été détectés avec la configuration Netlify.');
  console.log('[INFO] Certains problèmes ont été corrigés automatiquement, mais une vérification manuelle est recommandée.');
  process.exit(1);
} else {
  console.log('\n[OK] La configuration Netlify est valide.');
  process.exit(0);
}
