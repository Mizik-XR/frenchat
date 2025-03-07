
// Script pour vérifier la configuration Netlify et corriger les problèmes courants
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Netlify...');

// Fonction pour vérifier si un fichier existe
function checkFileExists(filePath, description, required = false) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${description} trouvé: ${filePath}`);
  } else if (required) {
    console.error(`❌ ERREUR: ${description} MANQUANT: ${filePath}`);
    return false;
  } else {
    console.warn(`⚠️ ATTENTION: ${description} non trouvé: ${filePath}`);
  }
  return exists;
}

// Vérifier les fichiers essentiels
const netlifyTomlExists = checkFileExists('netlify.toml', 'Fichier de configuration Netlify');
const redirectsExists = checkFileExists('_redirects', 'Fichier de redirection Netlify');
const headersExists = checkFileExists('_headers', 'Fichier d\'en-têtes Netlify') || 
                      checkFileExists('scripts/_headers', 'Fichier d\'en-têtes Netlify (dans scripts)');

// Vérifier la configuration base dans vite.config.ts
let viteConfigOk = false;
if (checkFileExists('vite.config.ts', 'Configuration Vite', true)) {
  try {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
    
    // Vérifier si base: './' est configuré
    if (viteConfig.includes("base: './'") || viteConfig.includes('base: "./')) {
      console.log('✅ Configuration base: "./" trouvée dans vite.config.ts');
      viteConfigOk = true;
    } else {
      console.error('❌ ERREUR: base: "./" manquant dans vite.config.ts');
      console.error('   C\'est ESSENTIEL pour que Netlify fonctionne correctement.');
      console.error('   Sans cela, les imports seront absolus et Netlify retournera index.html au lieu des fichiers JS.');
    }
    
    // Vérifier si les plugins nécessaires sont configurés
    if (viteConfig.includes('ensureRelativePaths')) {
      console.log('✅ Plugin ensureRelativePaths trouvé dans vite.config.ts');
    } else {
      console.warn('⚠️ ATTENTION: Plugin ensureRelativePaths non trouvé dans vite.config.ts');
    }
    
    if (viteConfig.includes('copyRedirectsAndHeaders')) {
      console.log('✅ Plugin copyRedirectsAndHeaders trouvé dans vite.config.ts');
    } else {
      console.warn('⚠️ ATTENTION: Plugin copyRedirectsAndHeaders non trouvé dans vite.config.ts');
    }
  } catch (error) {
    console.error('❌ ERREUR de lecture de vite.config.ts:', error.message);
  }
}

// Vérifier l'index.html si existant (pour les chemins absolus et le script Lovable)
if (fs.existsSync('dist/index.html')) {
  try {
    const indexContent = fs.readFileSync('dist/index.html', 'utf8');
    
    // Vérifier les chemins absolus
    const absolutePathsCount = (indexContent.match(/src="\//g) || []).length + 
                              (indexContent.match(/href="\//g) || []).length;
    
    if (absolutePathsCount > 0) {
      console.warn(`⚠️ ATTENTION: ${absolutePathsCount} chemins absolus détectés dans dist/index.html`);
      console.warn('   Cela causera probablement des erreurs MIME type dans Netlify.');
    } else {
      console.log('✅ Aucun chemin absolu trouvé dans dist/index.html');
    }
    
    // Vérifier le script Lovable
    if (indexContent.includes('cdn.gpteng.co/gptengineer.js')) {
      console.log('✅ Script Lovable trouvé dans dist/index.html');
    } else {
      console.warn('⚠️ ATTENTION: Script Lovable manquant dans dist/index.html');
    }
  } catch (error) {
    console.error('❌ ERREUR de lecture de dist/index.html:', error.message);
  }
}

// Vérifier si des fichiers JS dans dist contiennent des chemins absolus
if (fs.existsSync('dist/assets')) {
  try {
    const jsFiles = fs.readdirSync('dist/assets')
      .filter(file => file.endsWith('.js'));
    
    let jsFilesWithAbsolutePaths = 0;
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(path.join('dist/assets', file), 'utf8');
        const hasAbsolutePaths = content.includes('from"/') || 
                                content.includes('import"/') || 
                                content.includes('fetch("/');
        
        if (hasAbsolutePaths) {
          jsFilesWithAbsolutePaths++;
        }
      } catch (error) {
        console.error(`❌ ERREUR de lecture de dist/assets/${file}:`, error.message);
      }
    }
    
    if (jsFilesWithAbsolutePaths > 0) {
      console.warn(`⚠️ ATTENTION: ${jsFilesWithAbsolutePaths} fichiers JS contiennent des chemins absolus`);
    } else {
      console.log('✅ Aucun fichier JS avec des chemins absolus détecté');
    }
  } catch (error) {
    console.error('❌ ERREUR lors de la vérification des fichiers JS:', error.message);
  }
}

// Résumé de la vérification
console.log('\n📋 Résumé de la vérification:');
if (!viteConfigOk || !netlifyTomlExists || !redirectsExists) {
  console.error('❌ Des problèmes importants ont été détectés qui pourraient empêcher le déploiement Netlify.');
  console.error('   Veuillez corriger ces problèmes avant de déployer.');
  process.exit(1);
} else {
  console.log('✅ Configuration de base correcte pour Netlify.');
  console.log('   Vous pouvez déployer avec confiance, mais surveillez les avertissements ci-dessus.');
  process.exit(0);
}
