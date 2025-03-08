
#!/usr/bin/env node

/**
 * Script de configuration du déploiement Netlify
 * Prépare l'application FileChat pour un déploiement sur Netlify
 * en ajustant les configurations et en vérifiant les compatibilités
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Fonction pour afficher un message de bienvenue
function showWelcome() {
  console.log(chalk.blue.bold('================================================='));
  console.log(chalk.blue.bold('    PRÉPARATION DU DÉPLOIEMENT NETLIFY'));
  console.log(chalk.blue.bold('    POUR FILECHAT'));
  console.log(chalk.blue.bold('================================================='));
  console.log('');
  console.log('Ce script va préparer votre application pour le déploiement sur Netlify.');
  console.log('');
}

// Fonction pour vérifier les prérequis
function checkPrerequisites() {
  console.log(chalk.blue.bold('1. Vérification des prérequis'));
  
  // Vérifier l'existence des fichiers essentiels
  const requiredFiles = [
    'netlify.toml',
    'package.json',
    'vite.config.ts'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(chalk.green(`✓ ${file} trouvé`));
    } else {
      console.log(chalk.red(`× ${file} manquant`));
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    console.log(chalk.red('Certains fichiers requis sont manquants. Abandon.'));
    process.exit(1);
  }
  
  console.log(chalk.green('Tous les prérequis sont satisfaits.'));
  console.log('');
}

// Fonction pour vérifier et créer les répertoires nécessaires
function ensureDirectories() {
  console.log(chalk.blue.bold('2. Création des répertoires nécessaires'));
  
  const directories = [
    'netlify/functions',
    'public',
    'dist'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(chalk.green(`✓ Répertoire ${dir} créé`));
      } catch (error) {
        console.log(chalk.red(`× Erreur lors de la création du répertoire ${dir}: ${error.message}`));
      }
    } else {
      console.log(chalk.green(`✓ Répertoire ${dir} existe déjà`));
    }
  }
  
  console.log('');
}

// Fonction pour vérifier les fichiers de redirection et d'en-têtes
function checkRedirectsAndHeaders() {
  console.log(chalk.blue.bold('3. Vérification des redirections et en-têtes'));
  
  // Vérifier et créer _redirects si nécessaire
  if (!fs.existsSync('_redirects')) {
    try {
      fs.writeFileSync('_redirects', '/* /index.html 200\n');
      console.log(chalk.green('✓ Fichier _redirects créé'));
    } catch (error) {
      console.log(chalk.red(`× Erreur lors de la création de _redirects: ${error.message}`));
    }
  } else {
    console.log(chalk.green('✓ Fichier _redirects existe déjà'));
  }
  
  // Vérifier et créer _headers si nécessaire
  if (!fs.existsSync('_headers')) {
    try {
      fs.writeFileSync('_headers', `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);
      console.log(chalk.green('✓ Fichier _headers créé'));
    } catch (error) {
      console.log(chalk.red(`× Erreur lors de la création de _headers: ${error.message}`));
    }
  } else {
    console.log(chalk.green('✓ Fichier _headers existe déjà'));
  }
  
  console.log('');
}

// Fonction pour exécuter les vérifications de modules
function runModuleChecks() {
  console.log(chalk.blue.bold('4. Vérification de la compatibilité des modules'));
  
  try {
    if (fs.existsSync('scripts/check-module-compatibility.js')) {
      console.log(chalk.cyan('Exécution du script de vérification de compatibilité...'));
      
      try {
        execSync('node scripts/check-module-compatibility.js', { stdio: 'inherit' });
        console.log(chalk.green('✓ Vérification de compatibilité terminée'));
      } catch (error) {
        console.log(chalk.yellow('⚠ Des problèmes de compatibilité ont été détectés. Veuillez les corriger avant le déploiement.'));
      }
    } else {
      console.log(chalk.yellow('⚠ Script de vérification de compatibilité non trouvé. Ignoré.'));
    }
  } catch (error) {
    console.log(chalk.red(`× Erreur lors de la vérification des modules: ${error.message}`));
  }
  
  console.log('');
}

// Fonction pour préparer les variables d'environnement
function setupEnvironmentVariables() {
  console.log(chalk.blue.bold('5. Configuration des variables d\'environnement'));
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const recommendedVars = [
    'VITE_CLOUD_MODE',
    'VITE_ALLOW_LOCAL_AI',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  console.log(chalk.yellow('⚠ IMPORTANT: Les variables d\'environnement suivantes doivent être configurées dans l\'interface Netlify:'));
  
  for (const varName of requiredVars) {
    console.log(chalk.red(`   - ${varName} (OBLIGATOIRE)`));
  }
  
  for (const varName of recommendedVars) {
    console.log(chalk.yellow(`   - ${varName} (RECOMMANDÉ)`));
  }
  
  console.log('');
  console.log(chalk.cyan('Pour configurer ces variables:'));
  console.log('1. Accédez à votre projet Netlify dans le tableau de bord');
  console.log('2. Allez dans Site settings > Build & deploy > Environment');
  console.log('3. Ajoutez chaque variable avec sa valeur');
  console.log('');
}

// Fonction pour générer un fichier README de déploiement
function generateDeploymentReadme() {
  console.log(chalk.blue.bold('6. Génération d\'un guide de déploiement'));
  
  const readmeContent = `# Guide de déploiement Netlify pour FileChat

## Étapes de déploiement

1. **Connectez votre dépôt à Netlify**
   - Accédez à [app.netlify.com](https://app.netlify.com)
   - Cliquez sur "New site from Git"
   - Sélectionnez votre dépôt GitHub

2. **Configurez les paramètres de build**
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`

3. **Configurez les variables d'environnement**
   - SUPABASE_URL (Obligatoire)
   - SUPABASE_SERVICE_ROLE_KEY (Obligatoire)
   - VITE_CLOUD_MODE=true
   - VITE_ALLOW_LOCAL_AI=false
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

4. **Déployez votre site**
   - Cliquez sur "Deploy site"

## Résolution des problèmes

Si vous rencontrez des erreurs:

1. Vérifiez les logs de build dans l'interface Netlify
2. Assurez-vous que toutes les variables d'environnement sont correctement définies
3. Consultez la page de diagnostic: votresite.netlify.app/netlify-diagnostic.html

## Fonctions Netlify

Les fonctions Netlify se trouvent dans le dossier \`netlify/functions\`.
Vous pouvez les appeler via \`/.netlify/functions/nom-de-la-fonction\`.

## Ressources

- [Documentation Netlify](https://docs.netlify.com/)
- [Documentation FileChat](lien-vers-votre-documentation)
`;

  try {
    fs.writeFileSync('netlify-deployment-guide.md', readmeContent);
    console.log(chalk.green('✓ Guide de déploiement généré: netlify-deployment-guide.md'));
  } catch (error) {
    console.log(chalk.red(`× Erreur lors de la génération du guide: ${error.message}`));
  }
  
  console.log('');
}

// Fonction principale
function main() {
  showWelcome();
  checkPrerequisites();
  ensureDirectories();
  checkRedirectsAndHeaders();
  runModuleChecks();
  setupEnvironmentVariables();
  generateDeploymentReadme();
  
  console.log(chalk.blue.bold('================================================='));
  console.log(chalk.green.bold('    PRÉPARATION TERMINÉE AVEC SUCCÈS'));
  console.log(chalk.blue.bold('================================================='));
  console.log('');
  console.log('Votre application est prête à être déployée sur Netlify.');
  console.log('');
  console.log(chalk.cyan('Étapes suivantes:'));
  console.log('1. Exécutez `npm run build` pour générer les fichiers de production');
  console.log('2. Connectez votre dépôt à Netlify dans l\'interface web');
  console.log('3. Configurez les variables d\'environnement dans Netlify');
  console.log('4. Déclenchez un déploiement');
  console.log('');
  console.log(chalk.yellow('Pour plus d\'informations, consultez le fichier netlify-deployment-guide.md'));
  console.log('');
}

// Exécuter la fonction principale
main();
