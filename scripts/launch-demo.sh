
#!/bin/bash

# Définir l'encodage UTF-8
export LC_ALL=en_US.UTF-8

echo "==================================================="
echo "     DÉMARRAGE DE LA DÉMO FILECHAT"
echo "==================================================="
echo
echo "Cette démo vous permettra de découvrir les fonctionnalités"
echo "de FileChat sans avoir besoin de configurer l'ensemble"
echo "de l'infrastructure."
echo
echo "==================================================="
echo

# Vérifier si http-server est installé
if ! command -v http-server &> /dev/null
then
    echo "[INFO] Installation de http-server..."
    npm install -g http-server
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation de http-server échouée."
        echo "         Veuillez exécuter manuellement: npm install -g http-server"
        echo
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
fi

# Vérification du dossier dist
echo "[INFO] Vérification des fichiers..."
if [ ! -d "dist" ]; then
    echo "[INFO] Construction de l'application en cours..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Construction de l'application échouée"
        echo
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
fi

# Définir l'URL de démo
DEMO_URL="http://localhost:8080/demo?client=true"

# Démarrage du serveur web
echo "[INFO] Démarrage du serveur web..."
http-server dist -p 8080 -c-1 --cors &
SERVER_PID=$!
sleep 2

# Ouvrir le navigateur avec l'URL de la démo
echo "[INFO] Lancement de la démo dans votre navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$DEMO_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$DEMO_URL" || sensible-browser "$DEMO_URL" || x-www-browser "$DEMO_URL" || gnome-open "$DEMO_URL"
else
    # Windows ou autre
    start "$DEMO_URL" || echo "Veuillez ouvrir manuellement: $DEMO_URL"
fi

echo
echo "==================================================="
echo "      LA DÉMO FILECHAT EST PRÊTE !"
echo "==================================================="
echo
echo "La démo s'exécute maintenant dans votre navigateur."
echo "URL d'accès: $DEMO_URL"
echo
echo "Appuyez sur Ctrl+C pour arrêter le serveur quand vous"
echo "avez terminé d'explorer la démo."
echo
echo "==================================================="
echo

# Attendre que l'utilisateur appuie sur Ctrl+C
wait $SERVER_PID
