
# Guide de dépannage de l'installation FileChat

Si vous rencontrez des problèmes lors de l'installation ou du déploiement de FileChat, voici quelques étapes pour résoudre les problèmes courants.

## Problème 1: Erreur de déploiement Netlify

### Symptômes
- Erreur: "Failed during stage 'install dependencies': dependency_installation script returned non-zero exit code: 1"
- Build échoué sur Netlify

### Solution
1. Mettez à jour les paramètres de build dans l'interface Netlify:
   - Commande de build: `node scripts/netlify-prebuild.js && npm run build`
   - Variables d'environnement à ajouter:
     ```
     NO_RUST_INSTALL=1
     TRANSFORMERS_OFFLINE=1
     NODE_OPTIONS=--max-old-space-size=4096
     SKIP_PYTHON_INSTALLATION=true
     VITE_CLOUD_MODE=true
     VITE_ALLOW_LOCAL_AI=false
     ```

2. Utilisez le déploiement manuel:
   ```
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Vérifiez vos fichiers de configuration:
   - Assurez-vous que `.npmrc` est correctement configuré
   - Vérifiez que `netlify.toml` est présent et contient les redirections nécessaires

## Problème 2: Page blanche après déploiement

### Symptômes
- Site déployé mais affiche une page blanche
- Erreurs dans la console du navigateur concernant les chemins

### Solution
1. Vérifiez les chemins d'accès dans votre fichier HTML:
   ```
   scripts/unix/fix-blank-page.sh
   ```
   ou sous Windows:
   ```
   scripts\fix-blank-page.bat
   ```

2. Assurez-vous que les redirections sont correctement configurées dans `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
     force = true
   ```

3. Vérifiez la configuration de base:
   ```
   vite.config.ts
   ```
   pour vous assurer que la base URL est correctement définie.

## Problème 3: Erreurs JavaScript dans la console

### Symptômes
- Erreurs de type "undefined is not a function" 
- Références à des fonctions "unstable_scheduleCallback" ou autres erreurs React

### Solution
1. Activez le mode cloud pour contourner les fonctionnalités locales problématiques:
   - Définissez `VITE_ALLOW_LOCAL_AI=false` et `VITE_CLOUD_MODE=true`
   - Utilisez cette commande pour tester localement:
     ```
     scripts\cloud-mode.bat
     ```
     ou sur Unix:
     ```
     ./scripts/unix/cloud-mode.sh
     ```

2. Vérifiez les erreurs de console et cherchez les imports manquants/conflits de versions:
   - Lancez la commande de diagnostic pour obtenir plus d'informations:
     ```
     scripts\diagnostic.bat
     ```

## Problème 4: Utilisation de mode alternative (sans Python/Rust)

Si vous continuez à rencontrer des difficultés avec le déploiement complet:

1. Déployez en mode cloud uniquement:
   - Définissez `VITE_ALLOW_LOCAL_AI=false` dans les variables d'environnement Netlify
   - Utilisez une API externe pour les fonctionnalités d'IA

2. Utilisez le déploiement manuel avec préparation optimisée:
   ```
   scripts/unix/prepare-deployment.sh
   netlify deploy --prod --dir=dist
   ```
   ou sous Windows:
   ```
   scripts\prepare-deployment.bat
   netlify deploy --prod --dir=dist
   ```

## Besoin d'aide supplémentaire?
Si les problèmes persistent, lancez l'outil de diagnostic et partagez les résultats pour obtenir une assistance plus précise.
```
scripts\diagnostic.bat
```
ou
```
scripts/unix/diagnostic.sh
```
