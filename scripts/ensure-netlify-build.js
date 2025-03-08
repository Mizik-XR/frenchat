
/**
 * Script de vérification de la configuration Netlify
 * Vérifie que tous les fichiers nécessaires sont présents
 * et que la configuration est correcte pour le déploiement.
 */

const fs = require('fs');
const path = require('path');

// Liste des fichiers essentiels pour le déploiement
const REQUIRED_FILES = [
  { path: '_redirects', message: 'Fichier _redirects pour les règles de redirection Netlify' },
  { path: 'netlify.toml', message: 'Configuration Netlify (netlify.toml)' },
  { path: 'vite.config.ts', message: 'Configuration Vite' },
];

// Configurations à vérifier dans vite.config.ts
const VITE_CONFIG_CHECKS = [
  {
    regex: /base\s*:\s*['"]\.\//,
    message: "La propriété 'base: \"./\"' qui est essentielle pour les chemins relatifs",
    fix: (content) => {
      if (content.includes('defineConfig(')) {
        // Si la configuration utilise defineConfig
        if (content.includes('base:')) {
          // La propriété base existe, mais n'est pas correcte
          return content.replace(/base\s*:\s*['"][^'"]*['"]/g, 'base: "./"');
        } else {
          // Ajouter la propriété base
          return content.replace(/defineConfig\(\s*\{/g, 'defineConfig({\n  base: "./",');
        }
      }
      // Configuration non standard, ne pas modifier
      return content;
    }
  },
  {
    regex: /copyPublicDir\s*:\s*true/,
    message: "L'option 'copyPublicDir: true' pour copier les fichiers publics",
    fix: (content) => {
      if (content.includes('build:')) {
        if (content.includes('copyPublicDir:')) {
          return content.replace(/copyPublicDir\s*:\s*(false|[^,\n\r}]*)/g, 'copyPublicDir: true');
        } else {
          return content.replace(/build\s*:\s*\{/g, 'build: {\n    copyPublicDir: true,');
        }
      }
      return content;
    }
  }
];

// Vérification du fichier _redirects
function checkRedirects() {
  try {
    if (!fs.existsSync('_redirects')) {
      console.log('⚠️ Fichier _redirects manquant, création automatique...');
      fs.writeFileSync('_redirects', '/* /index.html 200\n');
      console.log('✅ Fichier _redirects créé avec succès.');
    } else {
      const content = fs.readFileSync('_redirects', 'utf8');
      if (!content.includes('/* /index.html 200')) {
        console.log('⚠️ Règle de redirection SPA manquante dans _redirects, ajout automatique...');
        fs.appendFileSync('_redirects', '\n/* /index.html 200\n');
        console.log('✅ Règle de redirection SPA ajoutée au fichier _redirects.');
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification de _redirects: ${error.message}`);
  }
}

// Vérification de la configuration Vite
function checkViteConfig() {
  try {
    if (!fs.existsSync('vite.config.ts') && !fs.existsSync('vite.config.js')) {
      console.error('❌ Fichier de configuration Vite manquant (vite.config.ts ou vite.config.js).');
      return false;
    }

    const configPath = fs.existsSync('vite.config.ts') ? 'vite.config.ts' : 'vite.config.js';
    let content = fs.readFileSync(configPath, 'utf8');
    let hasChanges = false;

    // Vérifier chaque élément de configuration
    for (const check of VITE_CONFIG_CHECKS) {
      if (!check.regex.test(content)) {
        console.log(`⚠️ Configuration Vite: ${check.message} est manquante ou incorrecte.`);
        const newContent = check.fix(content);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
    }

    // Appliquer les modifications si nécessaire
    if (hasChanges) {
      console.log('📝 Application des corrections à la configuration Vite...');
      fs.writeFileSync(configPath, content);
      console.log('✅ Configuration Vite mise à jour avec succès.');
    }

    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification de la configuration Vite: ${error.message}`);
    return false;
  }
}

// Vérification des fichiers requis
function checkRequiredFiles() {
  let allFilesPresent = true;

  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(file.path)) {
      console.log(`⚠️ ${file.message} est manquant (${file.path}).`);
      allFilesPresent = false;
    }
  }

  return allFilesPresent;
}

// Fonction principale
function main() {
  console.log('🔍 Vérification de la configuration pour le déploiement Netlify...');
  
  // Vérifier les fichiers requis
  const filesPresent = checkRequiredFiles();
  
  // Vérifier le fichier _redirects
  checkRedirects();
  
  // Vérifier la configuration Vite
  const viteConfigOk = checkViteConfig();
  
  if (filesPresent && viteConfigOk) {
    console.log('✅ La configuration pour Netlify semble correcte.');
    return 0;
  } else {
    console.log('⚠️ Certains problèmes ont été détectés et corrigés lorsque possible.');
    console.log('   Veuillez vérifier les messages ci-dessus pour plus de détails.');
    return 1;
  }
}

// Exécution du script
const exitCode = main();
process.exit(exitCode);
