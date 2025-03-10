
/**
 * Script pour corriger les problèmes de type MIME sur Vercel
 * Ce script ajoute un attribut type="module" aux balises script dans index.html
 * et vérifie la présence de bons paramètres dans vercel.json
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier index.html dans le dossier dist
const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');

console.log('🔍 Vérification et correction des types MIME pour Vercel...');

// Vérifier si le fichier index.html existe
if (!fs.existsSync(indexPath)) {
  console.error('❌ Erreur : dist/index.html non trouvé. Exécutez d\'abord le build.');
  process.exit(1);
}

// Lire le contenu du fichier index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Ajouter le meta tag pour éviter le MIME sniffing
if (!indexContent.includes('X-Content-Type-Options')) {
  console.log('➕ Ajout du meta tag X-Content-Type-Options: nosniff');
  indexContent = indexContent.replace(
    '<head>',
    '<head>\n    <meta http-equiv="X-Content-Type-Options" content="nosniff">'
  );
}

// S'assurer que tous les scripts ont un attribut type="module"
const scriptRegex = /<script\s+src="([^"]+)"(?!\s+type=["']module["'])/g;
let match;
let hasUpdatedScripts = false;

while ((match = scriptRegex.exec(indexContent)) !== null) {
  const originalScriptTag = match[0];
  const updatedScriptTag = originalScriptTag.replace(
    /<script\s+src="/,
    '<script type="module" src="'
  );
  indexContent = indexContent.replace(originalScriptTag, updatedScriptTag);
  hasUpdatedScripts = true;
}

// Ajouter ou mettre à jour le contentType script dans le head
const headerScript = `
    <script>
      // Script pour corriger les erreurs de type MIME
      (function() {
        // Ajouter un gestionnaire pour les erreurs de chargement de script
        window.addEventListener('error', function(e) {
          if (e && e.target && e.target.tagName === 'SCRIPT' && e.target.src) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = e.target.src;
            script.onerror = function() {
              console.error('Échec du rechargement du script:', e.target.src);
            };
            document.head.appendChild(script);
            console.log('Tentative de rechargement du script:', e.target.src);
            return false;
          }
        }, true);
      })();
    </script>
`;

if (!indexContent.includes('// Script pour corriger les erreurs de type MIME')) {
  console.log('➕ Ajout du script de récupération pour les erreurs MIME');
  indexContent = indexContent.replace(
    '</head>',
    `${headerScript}\n  </head>`
  );
}

// Écrire les modifications dans le fichier index.html
fs.writeFileSync(indexPath, indexContent);
console.log('✅ Fichier index.html mis à jour avec succès.');

// Vérifier le fichier vercel.json
if (fs.existsSync(vercelConfigPath)) {
  console.log('✅ Le fichier vercel.json existe.');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // Vérifier les headers pour les fichiers JavaScript
  let hasJsHeaders = false;
  if (vercelConfig.headers) {
    for (const header of vercelConfig.headers) {
      if (header.source && header.source.includes('.js')) {
        hasJsHeaders = true;
        break;
      }
    }
  }
  
  if (!hasJsHeaders) {
    console.log('⚠️ Avertissement : vercel.json ne contient pas de configuration correcte pour les types MIME JavaScript.');
    console.log('   Veuillez ajouter les headers appropriés pour les fichiers .js et .css.');
  } else {
    console.log('✅ La configuration des headers pour JavaScript est présente dans vercel.json.');
  }
} else {
  console.log('⚠️ Avertissement : vercel.json non trouvé dans le répertoire racine.');
}

console.log('🎉 Optimisation des types MIME terminée !');
