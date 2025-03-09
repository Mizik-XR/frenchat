
#!/bin/bash

echo "==================================================="
echo "     CORRECTION DES ERREURS DE PARSING NETLIFY"
echo "==================================================="
echo
echo "Ce script va corriger les erreurs communes dans le fichier netlify.toml"
echo

# Chemin du fichier netlify.toml
NETLIFY_FILE="netlify.toml"

# Vérifier si le fichier existe
if [ ! -f "$NETLIFY_FILE" ]; then
    echo "[ERREUR] Fichier netlify.toml introuvable!"
    exit 1
fi

echo "[INFO] Sauvegarde du fichier netlify.toml original..."
cp "$NETLIFY_FILE" "${NETLIFY_FILE}.bak"

echo "[INFO] Analyse du fichier netlify.toml..."

# Rechercher des lignes problématiques
if grep -q "Commande ECHO désactivée" "$NETLIFY_FILE"; then
    echo "[ERREUR] Ligne problématique trouvée: 'Commande ECHO désactivée'"
    echo "[INFO] Suppression de la ligne problématique..."
    
    # Supprimer la ligne problématique
    sed -i '/Commande ECHO désactivée/d' "$NETLIFY_FILE"
    
    echo "[OK] Ligne supprimée."
fi

# Rechercher d'autres problèmes courants
if grep -q "^#.*\n\s*#" "$NETLIFY_FILE"; then
    echo "[ATTENTION] Commentaires mal formatés détectés."
    echo "[INFO] Correction des commentaires..."
    
    # Correction des commentaires (simplifié)
    sed -i 's/^\(#.*\)\n\s*\(#\)/\1 \2/g' "$NETLIFY_FILE"
    
    echo "[OK] Commentaires corrigés."
fi

# Vérifier la validité de la syntaxe TOML
if command -v tomll >/dev/null 2>&1; then
    echo "[INFO] Vérification de la syntaxe TOML..."
    if tomll "$NETLIFY_FILE"; then
        echo "[OK] Fichier TOML valide."
    else
        echo "[ATTENTION] Le fichier peut contenir d'autres erreurs de syntaxe TOML."
    fi
else
    echo "[INFO] L'outil tomll n'est pas installé, la vérification de syntaxe complète n'est pas disponible."
fi

echo "[INFO] Création d'une version propre du fichier netlify.toml..."

# Réécrire proprement le fichier netlify.toml
cat > "${NETLIFY_FILE}.clean" << 'EOL'
# Configuration de build Netlify pour FileChat 
[build] 
  publish = "dist" 
  command = "npm run build" 
 
# Configuration des variables d'environnement par défaut 
[build.environment] 
  NODE_VERSION = "18" 
  NPM_FLAGS = "--prefer-offline --no-audit --no-fund" 
  NODE_OPTIONS = "--max-old-space-size=4096" 
  NO_RUST_INSTALL = "1" 
  NETLIFY_USE_YARN = "false" 
  TRANSFORMERS_OFFLINE = "1" 
  CI = "true" 
  SKIP_PYTHON_INSTALLATION = "true" 
  NETLIFY_SKIP_PYTHON_REQUIREMENTS = "true" 
  VITE_CLOUD_MODE = "true" 
  VITE_ALLOW_LOCAL_AI = "false" 
 
# Configuration des redirections pour le routage SPA 
[[redirects]] 
  from = "/*" 
  to = "/index.html" 
  status = 200 
  force = true

# Rediriger les API vers les fonctions Netlify 
[[redirects]] 
  from = "/api/*" 
  to = "/.netlify/functions/:splat" 
  status = 200 
 
# Configuration des fonctions Netlify 
[functions] 
  directory = "netlify/functions" 
  node_bundler = "esbuild" 
  included_files = ["**/*.model"] 
  external_node_modules = ["@supabase/supabase-js"] 
 
# En-têtes pour tous les fichiers 
[[headers]] 
  for = "/*" 
  [headers.values] 
    X-Frame-Options = "DENY" 
    X-XSS-Protection = "1; mode=block" 
    X-Content-Type-Options = "nosniff" 
    Referrer-Policy = "strict-origin-when-cross-origin" 
    Permissions-Policy = "camera=(), microphone=(), geolocation=()" 
    Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://*.sentry-cdn.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https://fonts.gstatic.com https: data:;" 
 
# En-têtes spécifiques pour les fichiers JavaScript 
[[headers]] 
  for = "/*.js" 
  [headers.values] 
    Content-Type = "application/javascript; charset=utf-8" 
    Cache-Control = "public, max-age=31536000, immutable" 
 
# En-têtes spécifiques pour les fichiers CSS 
[[headers]] 
  for = "/*.css" 
  [headers.values] 
    Content-Type = "text/css; charset=utf-8" 
    Cache-Control = "public, max-age=31536000, immutable" 
 
# En-têtes pour les assets 
[[headers]] 
  for = "/assets/*" 
  [headers.values] 
    Cache-Control = "public, max-age=31536000, immutable"

# Redirection pour la page de debug
[[redirects]]
  from = "/debug"
  to = "/debug.html"
  status = 200
EOL

echo "[INFO] Remplacement du fichier netlify.toml par la version propre..."
mv "${NETLIFY_FILE}.clean" "$NETLIFY_FILE"

echo "[OK] Le fichier netlify.toml a été corrigé."
echo
echo "Si vous rencontrez toujours des problèmes après ce correctif,"
echo "vous pouvez restaurer le fichier de sauvegarde avec la commande:"
echo "mv ${NETLIFY_FILE}.bak ${NETLIFY_FILE}"
echo

# Rendre le script exécutable
chmod +x "$0"

echo "==================================================="
echo "     CORRECTION TERMINÉE"
echo "==================================================="
