
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.cyan('📦 Post-traitement du build pour Netlify...'));

// Configuration pour le post-traitement
const config = {
  distPath: path.resolve('./dist'),
  indexPath: path.resolve('./dist/index.html'),
  assets: {
    js: path.resolve('./dist/assets'),
    public: path.resolve('./public')
  },
  redirects: path.resolve('./_redirects'),
  headers: path.resolve('./_headers')
};

/**
 * Vérifier et corriger les chemins absolus dans le HTML
 */
function fixAbsolutePaths() {
  console.log(chalk.yellow('Vérification des chemins absolus...'));
  
  if (!fs.existsSync(config.indexPath)) {
    console.error(chalk.red('❌ index.html non trouvé!'));
    return false;
  }
  
  let content = fs.readFileSync(config.indexPath, 'utf-8');
  let originalContent = content;
  
  // Corriger les chemins absolus
  content = content.replace(/src="\//g, 'src="./');
  content = content.replace(/href="\//g, 'href="./');
  content = content.replace(/from="\//g, 'from="./');
  content = content.replace(/import="\//g, 'import="./');
  
  // Mettre à jour le contenu si nécessaire
  if (content !== originalContent) {
    fs.writeFileSync(config.indexPath, content);
    console.log(chalk.green('✅ Chemins absolus corrigés dans index.html'));
    return true;
  } else {
    console.log(chalk.green('✅ Aucun chemin absolu trouvé dans index.html'));
    return true;
  }
}

/**
 * Vérifier et corriger les chemins dans les fichiers JS
 */
function fixJSPaths() {
  console.log(chalk.yellow('Vérification des chemins dans les fichiers JS...'));
  
  if (!fs.existsSync(config.assets.js)) {
    console.warn(chalk.yellow('⚠️ Dossier assets/js non trouvé'));
    return true;
  }
  
  const jsFiles = fs.readdirSync(config.assets.js, { withFileTypes: true })
    .filter(file => file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.mjs')))
    .map(file => path.join(config.assets.js, file.name));
  
  let filesFixed = 0;
  
  jsFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf-8');
      let originalContent = content;
      
      // Corriger les imports
      content = content.replace(/from"\//g, 'from"./');
      content = content.replace(/import"\//g, 'import"./');
      content = content.replace(/fetch\("\/assets/g, 'fetch("./assets');
      content = content.replace(/new URL\("\//g, 'new URL("./');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        filesFixed++;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la modification de ${file}:`), error);
    }
  });
  
  if (filesFixed > 0) {
    console.log(chalk.green(`✅ Chemins corrigés dans ${filesFixed} fichiers JS`));
  } else {
    console.log(chalk.green('✅ Aucun chemin à corriger dans les fichiers JS'));
  }
  
  return true;
}

/**
 * Assurer que les fichiers Netlify nécessaires sont présents
 */
function ensureNetlifyFiles() {
  console.log(chalk.yellow('Vérification des fichiers Netlify...'));
  
  // Vérifier _redirects
  if (!fs.existsSync(path.join(config.distPath, '_redirects'))) {
    if (fs.existsSync(config.redirects)) {
      fs.copyFileSync(config.redirects, path.join(config.distPath, '_redirects'));
      console.log(chalk.green('✅ Fichier _redirects copié'));
    } else {
      fs.writeFileSync(path.join(config.distPath, '_redirects'), '/* /index.html 200');
      console.log(chalk.green('✅ Fichier _redirects créé avec configuration par défaut'));
    }
  }
  
  // Vérifier _headers
  if (!fs.existsSync(path.join(config.distPath, '_headers'))) {
    if (fs.existsSync(config.headers)) {
      fs.copyFileSync(config.headers, path.join(config.distPath, '_headers'));
      console.log(chalk.green('✅ Fichier _headers copié'));
    } else if (fs.existsSync(path.join('scripts', '_headers'))) {
      fs.copyFileSync(path.join('scripts', '_headers'), path.join(config.distPath, '_headers'));
      console.log(chalk.green('✅ Fichier _headers copié depuis scripts/'));
    }
  }
  
  return true;
}

/**
 * Ajouter le fichier de diagnostic pour Netlify
 */
function addDiagnosticFile() {
  console.log(chalk.yellow('Ajout du fichier de diagnostic...'));
  
  if (fs.existsSync(path.join('public', 'netlify-diagnostic.html'))) {
    fs.copyFileSync(
      path.join('public', 'netlify-diagnostic.html'), 
      path.join(config.distPath, 'netlify-diagnostic.html')
    );
    console.log(chalk.green('✅ Fichier de diagnostic copié'));
  } else {
    console.log(chalk.yellow('⚠️ Fichier de diagnostic non trouvé, utilisation du template par défaut'));
    
    // Créer un fichier de diagnostic minimal
    const diagnosticContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnostic FileChat pour Netlify</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    button { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px; }
  </style>
</head>
<body>
  <h1>Diagnostic FileChat pour Netlify</h1>
  <p>Cette page fournit des informations de diagnostic pour le déploiement Netlify.</p>
  
  <div>
    <button onclick="showLogs()">Afficher logs</button>
    <button onclick="clearLogs()">Effacer logs</button>
    <button onclick="window.location.href='/'">Retour à l'application</button>
  </div>
  
  <h2>Informations système</h2>
  <pre id="systemInfo"></pre>
  
  <h2>Journaux d'application</h2>
  <div id="logs" style="max-height: 300px; overflow-y: auto;"></div>
  
  <script>
    // Afficher les informations système
    document.getElementById('systemInfo').textContent = JSON.stringify({
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    // Afficher les logs
    function showLogs() {
      try {
        const startupLogs = JSON.parse(localStorage.getItem('filechat_startup_log') || '[]');
        const errorLogs = JSON.parse(localStorage.getItem('filechat_error_log') || '[]');
        
        const logsElement = document.getElementById('logs');
        logsElement.innerHTML = '';
        
        if (startupLogs.length > 0) {
          const startupHeader = document.createElement('h3');
          startupHeader.textContent = 'Logs de démarrage';
          logsElement.appendChild(startupHeader);
          
          const logsList = document.createElement('ul');
          startupLogs.forEach(log => {
            const item = document.createElement('li');
            item.textContent = log;
            logsList.appendChild(item);
          });
          logsElement.appendChild(logsList);
        }
        
        if (errorLogs.length > 0) {
          const errorHeader = document.createElement('h3');
          errorHeader.textContent = 'Logs d\\'erreur';
          logsElement.appendChild(errorHeader);
          
          const logsList = document.createElement('ul');
          errorLogs.forEach(log => {
            const item = document.createElement('li');
            item.textContent = log;
            item.style.color = '#e11d48';
            logsList.appendChild(item);
          });
          logsElement.appendChild(logsList);
        }
        
        if (startupLogs.length === 0 && errorLogs.length === 0) {
          logsElement.textContent = 'Aucun log disponible.';
        }
      } catch (e) {
        document.getElementById('logs').textContent = 'Erreur lors de la récupération des logs: ' + e.message;
      }
    }
    
    // Effacer les logs
    function clearLogs() {
      try {
        localStorage.removeItem('filechat_startup_log');
        localStorage.removeItem('filechat_error_log');
        document.getElementById('logs').textContent = 'Logs effacés.';
      } catch (e) {
        document.getElementById('logs').textContent = 'Erreur lors de l\\'effacement des logs: ' + e.message;
      }
    }
  </script>
</body>
</html>
    `;
    
    fs.writeFileSync(path.join(config.distPath, 'netlify-diagnostic.html'), diagnosticContent);
    console.log(chalk.green('✅ Fichier de diagnostic créé'));
  }
  
  return true;
}

/**
 * Exécution principale
 */
async function main() {
  console.log(chalk.cyan('🚀 Début du post-traitement...'));
  
  // Vérifier si le dossier dist existe
  if (!fs.existsSync(config.distPath)) {
    console.error(chalk.red('❌ Dossier dist non trouvé! Assurez-vous d\'avoir exécuté la commande de build.'));
    process.exit(1);
  }
  
  // Exécuter les étapes de post-traitement
  const steps = [
    { name: 'Correction des chemins HTML', fn: fixAbsolutePaths },
    { name: 'Correction des chemins JS', fn: fixJSPaths },
    { name: 'Gestion des fichiers Netlify', fn: ensureNetlifyFiles },
    { name: 'Ajout du diagnostic', fn: addDiagnosticFile }
  ];
  
  let hasErrors = false;
  
  for (const step of steps) {
    console.log(chalk.cyan(`\n🔄 Exécution: ${step.name}...`));
    try {
      const result = await step.fn();
      if (!result) {
        console.warn(chalk.yellow(`⚠️ Étape "${step.name}" a signalé un problème`));
        hasErrors = true;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de l'étape "${step.name}":`), error);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.warn(chalk.yellow('\n⚠️ Le post-traitement a rencontré des problèmes.'));
  } else {
    console.log(chalk.green('\n✅ Post-traitement terminé avec succès.'));
  }
  
  console.log(chalk.cyan('\n📦 Build prêt pour déploiement sur Netlify!'));
}

// Exécuter le script
main().catch(error => {
  console.error(chalk.red('❌ Erreur fatale:'), error);
  process.exit(1);
});
