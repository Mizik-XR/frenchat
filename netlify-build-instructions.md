
# Instructions pour le build Netlify

Pour configurer correctement le build Netlify, configurez les paramètres suivants dans l'interface Netlify:

## Build Settings
- **Build command**: `node scripts/netlify-prebuild.js && npm run build`
- **Publish directory**: `dist`

## Environment Variables
Ajoutez ces variables d'environnement dans les paramètres de l'interface Netlify:

```
SKIP_PYTHON_INSTALLATION=true
NO_RUST_INSTALL=1
TRANSFORMERS_OFFLINE=1
VITE_CLOUD_MODE=true
VITE_ALLOW_LOCAL_AI=false
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## Ignorer l'installation Python
Dans l'interface Netlify, allez dans "Site settings" > "Build & deploy" > "Environment" et ajoutez:
- `NETLIFY_SKIP_PYTHON_REQUIREMENTS=true`

Ces paramètres contournent les problèmes d'installation des dépendances Python qui nécessitent Rust.
