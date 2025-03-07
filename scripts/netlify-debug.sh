
#!/bin/bash

echo "==================================================="
echo "     DIAGNOSTIC DE DÉPLOIEMENT NETLIFY"
echo "==================================================="
echo

# Vérifier la présence des fichiers critiques
echo "[ÉTAPE 1/4] Vérification des fichiers critiques..."
if [ ! -f "netlify.toml" ]; then
    echo "[ERREUR] Le fichier netlify.toml est manquant!"
    exit 1
fi

if [ ! -f "_redirects" ]; then
    echo "[INFO] Création du fichier _redirects manquant..."
    echo "/* /index.html 200" > _redirects
    echo "[OK] Fichier _redirects créé."
fi

# Vérifier les variables d'environnement
echo "[ÉTAPE 2/4] Vérification des variables d'environnement..."
echo "[INFO] Variables importantes pour Netlify:"
echo "- SKIP_PYTHON_INSTALLATION"
echo "- NETLIFY_SKIP_PYTHON_REQUIREMENTS"
echo "- NO_RUST_INSTALL"
echo "- TRANSFORMERS_OFFLINE"
echo "- VITE_CLOUD_MODE"
echo "- VITE_ALLOW_LOCAL_AI"
echo

# Nettoyer et reconstruire le projet
echo "[ÉTAPE 3/4] Nettoyage et reconstruction..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[INFO] Dossier dist supprimé."
fi

export NO_RUST_INSTALL=1
export TRANSFORMERS_OFFLINE=1
export SKIP_PYTHON_INSTALLATION=true
export NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export NODE_OPTIONS="--max-old-space-size=4096"

npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction a échoué."
    exit 1
fi

echo "[OK] Projet reconstruit avec succès."

# Vérifier le fichier index.html pour le script Lovable
echo "[ÉTAPE 4/4] Vérification des scripts..."
if [ -f "dist/index.html" ]; then
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script gptengineer.js est manquant dans dist/index.html."
        echo "[INFO] Application d'une correction manuelle..."
        
        # Ajouter le script manquant
        sed -i 's|<script type="module" src="/src/main.tsx"></script>|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>\n    <script type="module" src="/src/main.tsx"></script>|g' dist/index.html
        
        echo "[OK] Script ajouté avec succès."
    else
        echo "[OK] Le script gptengineer.js est présent."
    fi
else
    echo "[ERREUR] Le fichier dist/index.html est manquant!"
    exit 1
fi

echo
echo "==================================================="
echo "     DIAGNOSTIC TERMINÉ"
echo "==================================================="
echo
echo "Commandes pour déployer sur Netlify:"
echo "netlify deploy --prod --dir=dist"
echo
echo "Ou utiliser l'interface graphique de Netlify."
echo "N'oubliez pas de configurer les variables d'environnement dans l'interface Netlify!"
echo

chmod +x scripts/netlify-debug.sh
