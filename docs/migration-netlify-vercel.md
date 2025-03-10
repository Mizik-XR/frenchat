
# Guide de migration de Netlify vers Vercel

Ce document guide l'équipe dans la migration de l'application FileChat de Netlify vers Vercel.

## Pourquoi migrer?

- **Performance**: Vercel offre généralement de meilleures performances pour les applications React
- **Simplicité**: L'intégration avec les frameworks modernes est plus fluide
- **Fiabilité**: Moins de problèmes de build et de déploiement
- **Fonctionnalités**: Meilleures fonctionnalités pour les applications SPA

## Étapes de migration

### 1. Préparation du projet

✅ **Ajout du fichier `vercel.json`**
- Configurations des routes
- Variables d'environnement

✅ **Migration des fonctions serverless**
- Déplacement des fonctions Netlify vers le dossier `/api`
- Adaptation du format des fonctions

✅ **Ajustement des variables d'environnement**
- Mise à jour du fichier `.env.production`
- Adaptation des références aux variables

✅ **Scripts de déploiement**
- Ajout de scripts pour Windows et Unix
- Documentation du processus

### 2. Déploiement

1. **Connecter le dépôt** à Vercel
2. **Configurer les variables d'environnement**:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_CLOUD_MODE=true
   - VITE_ALLOW_LOCAL_AI=false
3. **Déclencher un déploiement** initial

### 3. Après la migration

- Vérifier le fonctionnement des API et des redirections
- Configurer un domaine personnalisé si nécessaire
- Mettre à jour la documentation interne
- Archiver les fichiers spécifiques à Netlify

## Comparaison des configurations

| Fonctionnalité | Netlify | Vercel |
|----------------|---------|--------|
| Commande de build | `npm run build` | `npm run build` |
| Dossier de publication | `dist` | `dist` |
| Fonctions | `netlify/functions/` | `/api/` |
| Redirections | `_redirects` ou `netlify.toml` | `vercel.json` |
| Variables d'env | Interface Netlify | Interface Vercel |

## Fonctionnalités qui ne changent pas

- Tous les aspects de l'application client React
- L'intégration avec Supabase
- Les configurations spécifiques à Vite

## Optimisations avancées

### Activation de Fluid Compute (abonnement Pro/Enterprise)

Si vous disposez d'un abonnement Vercel Pro ou Enterprise, vous pouvez activer Fluid Compute pour améliorer les performances:

1. Accédez à votre projet dans l'interface Vercel
2. Allez dans "Settings" > "Functions"
3. Activez l'option "Fluid Compute"
4. Sauvegardez les modifications

### Configuration des limites de mémoire et de durée

Ces paramètres sont déjà configurés dans votre fichier `vercel.json`:
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

## Résolution des problèmes courants

- **Problème**: Les API retournent 404  
  **Solution**: Vérifier la structure des fichiers dans `/api` et les routes dans `vercel.json`

- **Problème**: Les redirections SPA ne fonctionnent pas  
  **Solution**: Vérifier la configuration des routes dans `vercel.json`

- **Problème**: Erreurs de build  
  **Solution**: Examiner les logs de build dans l'interface Vercel
