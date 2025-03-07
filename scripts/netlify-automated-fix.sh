
#!/bin/bash

echo "==================================================="
echo "     CORRECTION AUTOMATIQUE NETLIFY"
echo "==================================================="
echo
echo "Ce script va automatiquement:"
echo "1. Créer les fichiers de configuration Netlify nécessaires"
echo "2. Preparer votre projet pour le déploiement"
echo "3. Vous guider pour committer et pousser les changements"
echo
echo "==================================================="
echo
echo "Appuyez sur Entrée pour commencer..."
read

# Créer les fichiers de configuration Netlify
echo "[ETAPE 1/3] Création des fichiers de configuration Netlify..."

# Créer/mettre à jour le fichier _headers
cat > _headers << EOL
# En-têtes globaux pour tous les fichiers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff

# En-têtes pour les fichiers JavaScript
/*.js
  Content-Type: application/javascript; charset=utf-8

# En-têtes pour les fichiers CSS
/*.css
  Content-Type: text/css; charset=utf-8

# En-têtes pour les assets dans le dossier /assets/
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# En-têtes pour les polices
/*.woff
  Content-Type: font/woff
/*.woff2
  Content-Type: font/woff2
/*.ttf
  Content-Type: font/ttf
/*.eot
  Content-Type: application/vnd.ms-fontobject
EOL

echo "[OK] Fichier _headers créé."

# Créer/mettre à jour le fichier _redirects
cat > _redirects << EOL
# Redirection SPA - toutes les routes non existantes vers index.html
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
EOL

echo "[OK] Fichier _redirects créé."

# Créer/mettre à jour le fichier netlify.toml
cat > netlify.toml << EOL
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
    Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;"

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
EOL

echo "[OK] Fichier netlify.toml créé."

echo "[ETAPE 2/3] Détection de Git..."

# Vérifier si git est installé
if ! command -v git &> /dev/null; then
    echo "[ATTENTION] Git n'est pas installé ou n'est pas dans le PATH."
    echo "              Vous devrez committer les changements manuellement."
    MANUAL_INSTRUCTIONS=1
else
    # Vérifier si le dossier est un dépôt git
    if [ ! -d ".git" ]; then
        echo "[ATTENTION] Ce dossier n'est pas un dépôt Git."
        echo "              Vous devrez committer les changements manuellement."
        MANUAL_INSTRUCTIONS=1
    else
        echo "[OK] Dépôt Git détecté."
        
        # Ajouter les fichiers au staging area
        git add _headers _redirects netlify.toml
        
        echo "[OK] Fichiers ajoutés à l'index git."
        
        # Prompt pour le commit
        echo
        echo "[ETAPE 3/3] Création du commit et envoi vers GitHub..."
        read -p "Voulez-vous créer un commit et l'envoyer vers GitHub maintenant? (O/N): " confirm
        
        if [[ "$confirm" =~ ^[Oo]$ ]]; then
            git commit -m "Fix: Configuration MIME types pour Netlify"
            
            if [ $? -ne 0 ]; then
                echo "[ERREUR] Erreur lors de la création du commit."
                MANUAL_INSTRUCTIONS=1
            else
                git push
                
                if [ $? -ne 0 ]; then
                    echo "[ERREUR] Erreur lors de l'envoi vers GitHub."
                    echo "          Vous devrez pousser les changements manuellement."
                    MANUAL_INSTRUCTIONS=1
                else
                    echo "[OK] Changements commités et envoyés vers GitHub avec succès!"
                    echo "     Netlify devrait démarrer un nouveau déploiement automatiquement."
                fi
            fi
        else
            echo "[INFO] Commit annulé."
            MANUAL_INSTRUCTIONS=1
        fi
    fi
fi

# Afficher les instructions manuelles si nécessaire
if [ "$MANUAL_INSTRUCTIONS" = "1" ]; then
    echo
    echo "==================================================="
    echo "     INSTRUCTIONS MANUELLES"
    echo "==================================================="
    echo
    echo "Pour envoyer ces modifications vers GitHub manuellement:"
    echo
    echo "1. Ouvrez GitHub Desktop"
    echo "2. Vous devriez voir les nouveaux fichiers dans la liste des changements"
    echo "3. Ajoutez un résumé comme \"Fix: Configuration MIME types pour Netlify\""
    echo "4. Cliquez sur \"Commit to main\""
    echo "5. Cliquez sur \"Push origin\" pour envoyer vers GitHub"
    echo
    echo "Une fois ces étapes effectuées, Netlify devrait détecter les"
    echo "changements automatiquement et lancer un nouveau déploiement."
    echo
fi

echo
echo "==================================================="
echo "     VÉRIFICATION FINALE"
echo "==================================================="
echo
echo "Les fichiers suivants ont été créés/modifiés:"
echo " - _headers       (définit les types MIME corrects)"
echo " - _redirects     (configure les redirections SPA)"
echo " - netlify.toml   (configuration complète Netlify)"
echo
echo "Pour vérifier le statut du déploiement:"
echo "1. Allez sur app.netlify.com"
echo "2. Sélectionnez votre site"
echo "3. Allez dans l'onglet \"Deploys\""
echo
echo "Si un déploiement est en cours, attendez qu'il se termine."
echo "Si aucun déploiement n'est visible, vous pouvez en déclencher"
echo "un manuellement depuis l'interface de Netlify."
echo

# Rendre le script exécutable
chmod +x "$0"
