
#!/bin/bash

echo "==================================================="
echo "            DÉMARRAGE UNIVERSEL DE FILECHAT"
echo "==================================================="
echo ""

# Vérification de la présence du script Lovable
echo "[INFO] Vérification de la configuration Lovable..."
if [ -f "index.html" ]; then
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Script Lovable manquant, correction en cours..."
        bash scripts/unix/fix-edit-issues.sh
    else
        echo "[OK] Configuration Lovable correcte."
    fi
else
    echo "[ATTENTION] index.html introuvable, vérification avancée nécessaire."
    if [ -f "scripts/unix/fix-blank-page.sh" ]; then
        bash scripts/unix/fix-blank-page.sh
    else
        echo "[ERREUR] Impossible de trouver les scripts de réparation."
        exit 1
    fi
fi

# Vérification de la compatibilité React
echo "[INFO] Vérification de la compatibilité React..."
if [ -f "node_modules/react/package.json" ]; then
    if ! grep -q "\"version\": \"18" "node_modules/react/package.json"; then
        echo "[ATTENTION] Version de React incompatible détectée, correction en cours..."
        npm uninstall react react-dom
        npm cache clean --force
        npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
        echo "[OK] React réinstallé avec la version compatible."
    else
        echo "[OK] Version de React compatible."
    fi
else
    echo "[ATTENTION] Installation React manquante ou incomplète."
    echo "[INFO] Installation des dépendances React..."
    npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
fi

# Choix du mode de démarrage
echo ""
echo "Choisissez le mode de démarrage :"
echo "1. Mode développement (npm run dev)"
echo "2. Mode production locale (start-app-simplified.sh)"
echo "3. Mode cloud uniquement (MODE_CLOUD=1)"
echo ""
read -p "Votre choix [1-3] (1 par défaut): " choice

case $choice in
    2)
        echo "[INFO] Démarrage en mode production locale..."
        bash scripts/unix/start-app-simplified.sh
        ;;
    3)
        echo "[INFO] Démarrage en mode cloud uniquement..."
        export MODE_CLOUD=1
        bash scripts/unix/start-app-simplified.sh
        ;;
    *)
        echo "[INFO] Démarrage en mode développement avec React compatible..."
        VITE_FORCE_REACT_VERSION=18.2.0 npm run dev
        ;;
esac

exit 0
