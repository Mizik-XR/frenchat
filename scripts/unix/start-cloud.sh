
#!/bin/bash

echo "==================================================="
echo "     DÉMARRAGE DE FILECHAT (MODE CLOUD)"
echo "==================================================="
echo ""

# Configuration du mode cloud
export FORCE_CLOUD_MODE=1
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export VITE_CORS_PROXY=true

# Vérification du dossier dist
if [ ! -d "dist" ]; then
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

# Vérifier si http-server est installé
if ! command -v http-server &> /dev/null; then
    echo "[INFO] Installation de http-server..."
    npm install -g http-server
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation de http-server échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] http-server installé."
fi

# Vérifier la présence du script Lovable
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Script Lovable non trouvé dans dist/index.html, application de correctifs..."
    cp index.html dist/index.html
    echo "[OK] Correctifs appliqués."
    echo ""
fi

# Démarrage du serveur web avec CORS activé
echo "[INFO] Lancement de l'application..."
http-server dist -p 8080 --cors -c-1 &
SERVER_PID=$!
sleep 2

# Ouvrir le navigateur avec les paramètres qui forcent le mode cloud
echo "[INFO] Ouverture dans votre navigateur..."
if [ "$(uname)" == "Darwin" ]; then
    # MacOS
    open "http://localhost:8080/?forceCloud=true&mode=cloud"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    xdg-open "http://localhost:8080/?forceCloud=true&mode=cloud" || sensible-browser "http://localhost:8080/?forceCloud=true&mode=cloud" || echo "Veuillez ouvrir manuellement: http://localhost:8080/?forceCloud=true&mode=cloud"
fi

echo ""
echo "==================================================="
echo "     FILECHAT DÉMARRÉ AVEC SUCCÈS (MODE CLOUD)"
echo "==================================================="
echo ""
echo "Pour arrêter l'application, appuyez sur Ctrl+C."
echo ""

# Attendre que l'utilisateur interrompe avec Ctrl+C
trap "echo ''; echo 'Fermeture de FileChat...'; kill $SERVER_PID; exit 0" INT
wait $SERVER_PID
