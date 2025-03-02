
#!/bin/bash

echo "====================================================="
echo "     DÉMARRAGE DE FILECHAT - MODE DE SECOURS"
echo "====================================================="
echo ""

# Configuration en mode minimal pour assurer le fonctionnement
export FORCE_CLOUD_MODE=1
export CLIENT_MODE=1
export VITE_DISABLE_DEV_MODE=1
export FALLBACK_MODE=1
export DISABLE_ADVANCED_FEATURES=1

# Vérification du dossier dist
echo "[INFO] Vérification des fichiers de l'application..."
if [ ! -d "dist" ]; then
    echo "[ERREUR] Le dossier 'dist' n'existe pas."
    echo "[INFO] Construction de l'application en cours..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] Application construite avec succès."
    echo ""
fi

# Vérification du fichier index.html dans dist
if [ ! -f "dist/index.html" ]; then
    echo "[ERREUR] Le fichier 'dist/index.html' est manquant."
    echo "[INFO] Reconstruction de l'application en cours..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] Application construite avec succès."
    echo ""
fi

# Démarrage d'un serveur HTTP simple
echo "[INFO] Démarrage du serveur web en mode minimal..."
if ! command -v http-server &> /dev/null; then
    echo "[INFO] Installation du serveur web..."
    npm install -g http-server || true
fi

# Lancement avec différentes méthodes en cas d'échec
(http-server dist -p 8080 -c-1 --cors || npx http-server dist -p 8080 -c-1 --cors) &
SERVER_PID=$!

# Ouvrir le navigateur avec des paramètres de secours
echo "[INFO] Ouverture dans votre navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8080?mode=fallback&client=true&hideDebug=true&forceCloud=true"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:8080?mode=fallback&client=true&hideDebug=true&forceCloud=true" &>/dev/null || 
    sensible-browser "http://localhost:8080?mode=fallback&client=true&hideDebug=true&forceCloud=true" &>/dev/null || 
    echo "[INFO] Veuillez ouvrir http://localhost:8080?mode=fallback&client=true&hideDebug=true&forceCloud=true dans votre navigateur"
fi

echo ""
echo "====================================================="
echo "    FILECHAT EST PRÊT À ÊTRE UTILISÉ"
echo "          MODE DE SECOURS ACTIVÉ"
echo "====================================================="
echo ""
echo "L'application démarre en mode minimal avec"
echo "des fonctionnalités réduites pour assurer un"
echo "chargement fiable."
echo ""
echo "Appuyez sur Ctrl+C pour quitter."
echo "====================================================="
echo ""

# Attendre que l'utilisateur arrête le script avec Ctrl+C
wait $SERVER_PID

echo ""
echo "Services arrêtés avec succès"
exit 0
