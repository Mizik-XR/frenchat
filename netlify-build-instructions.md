
# Instructions pour le build Netlify

Pour configurer correctement le build Netlify, configurez les paramètres suivants dans l'interface Netlify:

## Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## Environment Variables
Ajoutez ces variables d'environnement dans les paramètres de l'interface Netlify:

```
SKIP_PYTHON_INSTALLATION=true
NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
NO_RUST_INSTALL=1
TRANSFORMERS_OFFLINE=1
VITE_CLOUD_MODE=true
VITE_ALLOW_LOCAL_AI=false
NODE_OPTIONS=--max-old-space-size=4096
```

## Sécurité des clés API
⚠️ **IMPORTANT**: Pour des raisons de sécurité, configurez les clés API sensibles UNIQUEMENT via l'interface Netlify:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- Autres clés API (VITE_CLOUD_API_URL, etc.)

### Comment configurer les variables d'environnement
1. Dans le menu latéral gauche, allez dans "Site settings" ou "Site configuration"
2. Cherchez "Build & deploy" puis "Environment"
3. Cliquez sur "Edit variables" et ajoutez les variables ci-dessus
4. N'oubliez pas d'ajouter vos clés Supabase qui sont essentielles pour le fonctionnement de l'application

## Optimisation du déploiement
Ces paramètres contournent les problèmes d'installation des dépendances Python qui nécessitent Rust.

