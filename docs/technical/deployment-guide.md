
# Guide de déploiement FileChat sur Netlify

Ce guide détaille la procédure de déploiement de FileChat sur Netlify, les problèmes courants et leurs solutions.

## Configuration Netlify

### Fichiers essentiels
- **netlify.toml**: Configuration principale du déploiement
- **_redirects**: Gestion des redirections SPA
- **_headers**: Configuration des en-têtes HTTP

### Structure de `netlify.toml`
```toml
[build]
  publish = "dist"           # Dossier contenant les fichiers de build
  command = "npm run build"  # Commande pour construire le projet

[build.environment]          # Variables d'environnement pour le build
  NODE_VERSION = "18"
  VITE_CLOUD_MODE = "true"   # Mode cloud activé par défaut
  # ... autres variables

[[redirects]]                # Configuration des redirections
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
```

## Variables d'environnement critiques

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_CLOUD_MODE` | Mode d'exécution cloud | `true` |
| `SKIP_PYTHON_INSTALLATION` | Désactive l'installation Python | `true` |
| `NO_RUST_INSTALL` | Désactive l'installation Rust | `1` |

## Processus d'initialisation de l'application

L'application FileChat utilise un processus d'initialisation progressive pour éviter les erreurs de chargement:

1. **Chargement initial** (`index.html`):
   - Affiche un écran de chargement
   - Configure des gestionnaires d'erreurs précoces
   
2. **Initialisation progressive** (`main.tsx`):
   - Chargement asynchrone des modules (`import()`)
   - Analyse de l'environnement d'exécution
   - Initialisation des moniteurs d'erreur (Sentry en production)

3. **Démarrage de l'application** (`App.tsx`):
   - Configuration des providers React
   - Gestion des routes
   - Chargement des composants via React Suspense

## Dépannage des erreurs courantes

### Erreur: "Cannot access X before initialization"
Cette erreur indique un problème d'importation circulaire dans le code JavaScript.

**Solution**:
1. Utiliser des importations dynamiques (`import()`)
2. Restructurer les importations dans les fichiers problématiques
3. Vérifier l'ordre d'initialisation des modules

### Erreur: Page blanche après déploiement
1. Vérifier les redirections dans `netlify.toml`
2. Inspecter les erreurs JavaScript dans la console
3. Vérifier la présence et le contenu du fichier `_redirects`

### Erreur: Problèmes de script Lovable
Vérifier que le script `gptengineer.js` est correctement référencé dans `index.html`.

## Scripts de diagnostic et maintenance

```bash
# Vérification de la configuration Netlify
scripts/verify-netlify-deployment.sh

# Correction automatique des problèmes courants
scripts/netlify-automated-fix.sh

# Diagnostic des problèmes de déploiement
scripts/netlify-debug.sh
```

## Surveillance et logs

L'application utilise plusieurs niveaux de surveillance:

1. **Client**: Capture des erreurs JavaScript et stockage dans localStorage
2. **Environnement**: Détection des capacités du navigateur et de l'environnement
3. **Sentry**: Surveillance des erreurs en production (configurable)

## Architecture de l'initialisation

```
index.html                 # Écran de chargement et gestion des erreurs précoces
├── main.tsx               # Point d'entrée, initialisation progressive
│   ├── monitoring/        # Services de monitoring et capture d'erreurs
│   ├── App.tsx            # Configuration des providers et routage
│   └── pages/Index.tsx    # Page d'accueil, décision de routage
```

## Bonnes pratiques

1. **Toujours tester localement** avant de déployer
2. **Vérifier les variables d'environnement** dans l'interface Netlify
3. **Consulter les logs de build** en cas d'échec de déploiement
4. **Utiliser les scripts de diagnostic** pour identifier les problèmes
