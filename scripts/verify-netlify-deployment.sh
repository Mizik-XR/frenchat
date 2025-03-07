
#!/bin/bash

echo "====================================================="
echo "      VÉRIFICATION DU DÉPLOIEMENT NETLIFY"
echo "====================================================="
echo

# Exécution du script de vérification JavaScript
echo "[INFO] Vérification de la configuration Netlify..."
node scripts/ensure-netlify-build.js

# Vérification du build
if [ ! -d "dist" ]; then
    echo "[ATTENTION] Le dossier dist n'existe pas."
    echo "[INFO] Lancement du build..."
    
    # Définir des variables d'environnement optimisées pour Netlify
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NO_RUST_INSTALL=1
    export NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
    export SKIP_PYTHON_INSTALLATION=true
    
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Le build a échoué."
        exit 1
    else
        echo "[OK] Build réussi."
    fi
else
    echo "[INFO] Le dossier dist existe déjà."
fi

# Vérifier si les fichiers _redirects et _headers sont dans dist
if [ ! -f "dist/_redirects" ]; then
    echo "[INFO] Copie de _redirects dans dist..."
    cp _redirects dist/ 2>/dev/null || echo "/* /index.html 200" > dist/_redirects
fi

if [ ! -f "dist/_headers" ]; then
    echo "[INFO] Copie de _headers dans dist..."
    cp _headers dist/ 2>/dev/null || cp scripts/_headers dist/ 2>/dev/null
fi

# Vérifier tous les fichiers JS pour des chemins absolus
if [ -d "dist/assets" ]; then
    echo "[INFO] Vérification des fichiers JS pour des chemins absolus..."
    
    JS_FILES_WITH_ABSOLUTE_PATHS=0
    for file in dist/assets/*.js; do
        if grep -q "from\"/" "$file" || grep -q "import\"/" "$file" || grep -q "fetch(\"/" "$file"; then
            echo "  - Correction de chemins absolus dans: $(basename "$file")"
            sed -i 's|from"/|from"./|g' "$file"
            sed -i 's|import"/|import"./|g' "$file"
            sed -i 's|fetch("/|fetch("./|g' "$file"
            JS_FILES_WITH_ABSOLUTE_PATHS=$((JS_FILES_WITH_ABSOLUTE_PATHS + 1))
        fi
    done
    
    if [ $JS_FILES_WITH_ABSOLUTE_PATHS -gt 0 ]; then
        echo "[INFO] Corrigé des chemins absolus dans $JS_FILES_WITH_ABSOLUTE_PATHS fichiers JS"
    else
        echo "[OK] Aucun chemin absolu détecté dans les fichiers JS"
    fi
fi

# Vérifier index.html pour les chemins absolus
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification des chemins dans index.html..."
    
    # Recherche de chemins absolus
    ABSOLUTE_PATHS=$(grep -o 'src="/[^"]*"' dist/index.html || true)
    if [ -n "$ABSOLUTE_PATHS" ]; then
        echo "[ATTENTION] Chemins absolus détectés dans index.html. Correction..."
        sed -i 's|src="/|src="./|g' dist/index.html
        sed -i 's|href="/|href="./|g' dist/index.html
        echo "[OK] Chemins corrigés."
    else
        echo "[OK] Aucun chemin absolu détecté dans index.html."
    fi
    
    # Vérification du script Lovable
    if ! grep -q "cdn.gpteng.co/gptengineer.js" dist/index.html; then
        echo "[ATTENTION] Script Lovable manquant. Ajout..."
        sed -i 's|</body>|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script></body>|' dist/index.html
        echo "[OK] Script Lovable ajouté."
    else
        echo "[OK] Script Lovable présent."
    fi
else
    echo "[ERREUR] dist/index.html non trouvé!"
    exit 1
fi

echo
echo "====================================================="
echo "      VÉRIFICATION TERMINÉE AVEC SUCCÈS"
echo "====================================================="
echo
echo "Votre application est prête à être déployée sur Netlify."
echo "Assurez-vous de configurer les variables d'environnement"
echo "nécessaires dans l'interface Netlify."
echo
