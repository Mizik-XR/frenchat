
# Déploiement sur Vercel

Ce document explique comment déployer l'application FrenChat sur la plateforme Vercel.

## Prérequis

- Un compte Vercel (https://vercel.com)
- Node.js installé (v16+)
- npm ou yarn

## Option 1: Déploiement automatique avec GitHub

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement (voir ci-dessous)
3. Déployez automatiquement à chaque push

## Option 2: Déploiement manuel avec CLI

### Installation de la CLI Vercel

```bash
npm install -g vercel
```

### Authentification

```bash
vercel login
```

### Déploiement

Utilisez le script fourni:
- Windows: `scripts/deploy-vercel.bat`
- Unix/Mac: `scripts/unix/deploy-vercel.sh`

Ou déployez manuellement:
```bash
npm run build
vercel --prod
```

## Configuration requise

### Variables d'environnement

Configurez ces variables dans l'interface Vercel:

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_CLOUD_MODE=true
VITE_ALLOW_LOCAL_AI=false
VITE_SKIP_PYTHON_INSTALLATION=true
```

### Optimisation des performances

#### Configuration du CPU et de la mémoire

Dans l'interface Vercel, sous "Settings" > "Functions":

1. **Function Memory et Duration**: Ces paramètres sont configurés dans votre fichier `vercel.json`:
   ```json
   {
     "functions": {
       "api/**/*": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

2. **Fluid Compute (fonctionnalité premium)**: 
   - Cette option n'est disponible que pour les comptes Pro ou Enterprise
   - Pour l'activer:
     1. Souscrivez à un abonnement Pro ou Enterprise
     2. Accédez à "Settings" > "Functions" dans votre projet
     3. Cochez la case "Fluid Compute"
     4. Sauvegardez les modifications
   - L'application fonctionne parfaitement sans cette option

3. **Function Regions**: Sélectionnez les régions proches de vos utilisateurs pour de meilleures performances

### Configuration optionnelle

- **Domaine personnalisé**: Configurez un domaine personnalisé dans les paramètres du projet Vercel
- **Intégration continue**: Activez les prévisualisations automatiques pour chaque pull request
- **Surveillance des performances**: Utilisez Vercel Analytics pour le suivi des performances

## Dépannage

### Page blanche après déploiement

Vérifiez les redirections dans `vercel.json`. La configuration par défaut devrait rediriger toutes les routes vers l'application React.

### Erreurs 404 sur les API

Assurez-vous que:
1. Les chemins d'API sont correctement configurés dans `vercel.json`
2. Les fonctions API sont placées dans le dossier `/api` à la racine du projet

### Dépassement de mémoire pendant le build

Augmentez la limite de mémoire Node.js:
```
NODE_OPTIONS=--max-old-space-size=4096 vercel --prod
```

## Avantages de Vercel par rapport à Netlify

- Meilleure intégration avec les frameworks React
- Déploiements Edge plus rapides
- Meilleure prise en charge des fonctions serverless
- Interface plus intuitive
- Support amélioré pour les applications SPA
