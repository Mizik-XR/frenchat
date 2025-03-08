
# Guide de déploiement FileChat sur Netlify

Ce guide détaille la configuration optimale pour déployer FileChat sur Netlify, en mettant l'accent sur la gestion des erreurs et la fiabilité.

## Configuration du projet

### 1. Configuration Netlify
- Le fichier `netlify.toml` à la racine du projet configure tous les aspects du déploiement
- Les variables d'environnement sont définies dans la section `[build.environment]`

### 2. Gestion des erreurs
FileChat utilise un système de surveillance d'erreurs sophistiqué avec :
- Journalisation locale (localStorage)
- Détection des erreurs de chargement de ressources
- Gestion des exceptions React
- Récupération automatique en cas d'erreur

## Variables d'environnement importantes

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_CLOUD_MODE` | Active le mode cloud | `true` |
| `VITE_ENABLE_ERROR_FILTERING` | Filtre les erreurs non critiques | `true` |
| `VITE_MAX_ERROR_LOG_SIZE` | Nombre maximum d'entrées de journal | `100` |

## Dépannage courant

### Erreur : Page blanche après déploiement
1. Vérifiez les redirections dans `netlify.toml`
2. Assurez-vous que la directive `[[redirects]]` pour SPA est configurée correctement
3. Consultez les journaux de build dans l'interface Netlify

### Erreur : Problèmes de chargement de modules
Ces erreurs sont automatiquement détectées et enregistrées par `ReactErrorMonitor`.
Solutions :
1. Vérifiez la console du navigateur pour les erreurs spécifiques
2. Assurez-vous que tous les scripts externes ont les bonnes balises CORS
3. Si le problème persiste, essayez de vider le cache du navigateur

### Erreur : Problèmes liés aux plugins Netlify
Si vous rencontrez des erreurs liées aux plugins Netlify :
1. Commentez temporairement les sections de plugins dans `netlify.toml`
2. Utilisez une commande de build simple sans plugins personnalisés
3. Une fois le déploiement réussi, ajoutez progressivement les plugins si nécessaire

### Erreur : Problèmes de connexion API
1. Vérifiez que les variables d'environnement Supabase sont correctement configurées
2. Assurez-vous que les règles CORS dans `netlify.toml` sont correctes
3. L'application passera automatiquement en mode hors ligne si nécessaire

## Bonnes pratiques

1. **Tests avant déploiement**
   ```bash
   # Vérifier la configuration Netlify
   npm run build
   npx netlify-cli build
   ```

2. **Vérification post-déploiement**
   ```bash
   # Vérifier les erreurs dans l'application déployée
   npx netlify-cli functions:invoke diagnostic
   ```

3. **Monitoring**
   - Envisagez d'ajouter Sentry ou LogRocket pour un suivi plus détaillé
   - Consultez régulièrement les journaux de construction Netlify

Pour toute assistance supplémentaire, consultez la documentation complète de FileChat ou contactez l'équipe de support.
