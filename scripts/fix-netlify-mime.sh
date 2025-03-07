
#!/bin/bash

echo "==================================================="
echo "     CORRECTION DES ERREURS MIME POUR NETLIFY"
echo "==================================================="
echo

# Vérifier si nous sommes dans le répertoire racine du projet
if [ ! -f "package.json" ]; then
    echo "[ERREUR] Ce script doit être exécuté depuis la racine du projet."
    exit 1
fi

echo "[ÉTAPE 1/3] Création des fichiers de configuration Netlify..."

# Créer/mettre à jour le fichier _headers
cat > _headers << EOL
# En-têtes globaux pour tous les fichiers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey, x-client-info, range
  Access-Control-Max-Age: 86400

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

echo "[OK] Fichier _headers créé/mis à jour."

# Créer/mettre à jour le fichier _redirects
cat > _redirects << EOL
# Redirection SPA - toutes les routes non existantes vers index.html
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
EOL

echo "[OK] Fichier _redirects créé/mis à jour."

echo "[ÉTAPE 2/3] Construction optimisée du projet..."

# Nettoyer le dossier dist
if [ -d "dist" ]; then
    rm -rf dist
    echo "[INFO] Dossier dist nettoyé."
fi

# Variables d'environnement pour Netlify
export NO_RUST_INSTALL=1
export TRANSFORMERS_OFFLINE=1
export SKIP_PYTHON_INSTALLATION=true
export NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Construction du projet
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction a échoué."
    exit 1
fi

echo "[OK] Projet construit avec succès."

echo "[ÉTAPE 3/3] Post-traitement des fichiers pour Netlify..."

# Copier les fichiers _headers et _redirects dans le dossier dist
cp _headers dist/
cp _redirects dist/

# Vérifier le Content-Type dans les balises script de index.html
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification des balises script dans index.html..."
    
    # Modifier le type des scripts si nécessaire
    sed -i 's/type="module" src/type="module" crossorigin="anonymous" src/g' dist/index.html
    
    # Convertir les chemins absolus en chemins relatifs
    sed -i 's|src="/|src="./|g' dist/index.html
    sed -i 's|href="/|href="./|g' dist/index.html
    
    echo "[OK] Fichier index.html traité."
else
    echo "[ERREUR] Le fichier dist/index.html est manquant!"
    exit 1
fi

echo
echo "==================================================="
echo "     CORRECTION TERMINÉE"
echo "==================================================="
echo
echo "Fichiers prêts pour Netlify. Pour déployer :"
echo "netlify deploy --prod --dir=dist"
echo
echo "N'oubliez pas que les fichiers _headers et _redirects"
echo "sont maintenant inclus dans votre build."
echo

chmod +x scripts/fix-netlify-mime.sh
