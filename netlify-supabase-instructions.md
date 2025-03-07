
# Instructions pour vérifier la connexion Netlify-Supabase

Ce document explique comment vérifier que votre application déployée sur Netlify est correctement connectée à Supabase.

## 1. Vérifiez les variables d'environnement Netlify

La connexion entre Netlify et Supabase repose principalement sur les variables d'environnement. Voici comment les vérifier:

1. Connectez-vous à [Netlify](https://app.netlify.com/)
2. Sélectionnez votre site
3. Allez dans **Site settings** > **Environment variables**
4. Vérifiez que ces variables sont présentes et correctement configurées:
   - `VITE_SUPABASE_URL` - URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` - Clé anonyme (publique) de votre projet Supabase

## 2. Utilisez l'outil de diagnostic

Cet outil vous permet de vérifier la connexion en temps réel:

1. Ouvrez votre site déployé sur Netlify
2. Ouvrez la console du navigateur (F12 > Console)
3. Exécutez la commande suivante:
   ```javascript
   runNetlifySupabaseDiagnostic()
   ```
4. Examinez les résultats du diagnostic

## 3. Utilisez les scripts de vérification

Des scripts sont disponibles pour vérifier la configuration:

### Sur Windows:
```
scripts\verify-supabase-connection.bat
```

### Sur Mac/Linux:
```
bash scripts/verify-supabase-connection.sh
```

## 4. Signes d'une bonne connexion

Votre application est correctement connectée à Supabase si:

- Aucune erreur Supabase n'apparaît dans la console du navigateur
- Les fonctionnalités d'authentification fonctionnent (connexion/inscription)
- Les requêtes aux tables Supabase fonctionnent (affichage et manipulation de données)
- Les fonctions Edge s'exécutent correctement (si vous en utilisez)

## 5. Résolution des problèmes courants

### Erreur "Network request failed"
- Vérifiez que l'URL Supabase est correcte
- Vérifiez que votre projet Supabase est actif

### Erreur "JWT expired"
- Problème d'authentification, essayez de vous reconnecter

### Erreur "Invalid API key"
- Vérifiez que VITE_SUPABASE_ANON_KEY est correctement configurée

### Redirection infinie ou page blanche
- Vérifiez que le fichier `_redirects` ou `netlify.toml` contient la règle de redirection SPA:
  ```
  /*  /index.html  200
  ```

## 6. Mise à jour de la configuration

Si vous devez mettre à jour la configuration:

1. Modifiez les variables d'environnement dans l'interface Netlify
2. Déclenchez un nouveau déploiement (Deploy > Trigger deploy)
3. Vérifiez que les modifications sont prises en compte

## Remarque importante

Les variables d'environnement Supabase doivent être configurées dans l'interface Netlify, et non dans vos fichiers source, pour des raisons de sécurité.
