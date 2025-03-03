
#!/bin/bash

echo "================================"
echo "FileChat - Mode Cloud (Local)"
echo "================================"
echo ""

# Configuration en mode cloud uniquement
export FORCE_CLOUD_MODE=1
export CLIENT_MODE=1
export VITE_DISABLE_DEV_MODE=1

# Vérification et installation de http-server si nécessaire
if ! command -v http-server &> /dev/null; then
    echo "[INFO] Installation du serveur web..."
    npm install -g http-server
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation du serveur web échouée."
        echo "         Veuillez contacter le support technique."
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
fi

# Construire l'application
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

# Vérification que le fichier contient le script nécessaire pour Lovable
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Le script Lovable manque dans index.html, reconstruction..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] Application reconstruite avec succès."
    echo ""
fi

# URL avec paramètres normalisés
APP_URL="http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

# Démarrage du serveur web
echo "[INFO] Lancement de l'application..."
http-server dist -p 8080 -c-1 --cors &
SERVER_PID=$!
sleep 2

# Ouvrir le navigateur avec le mode client activé, debug désactivé et cloud forcé
echo "[INFO] Ouverture dans votre navigateur..."
if command -v xdg-open &> /dev/null; then
    xdg-open "$APP_URL"
elif command -v open &> /dev/null; then
    open "$APP_URL"
else
    echo "[INFO] Ouvrez manuellement ce lien dans votre navigateur:"
    echo "$APP_URL"
fi

echo ""
echo "================================"
echo "FILECHAT EST PRÊT À ÊTRE UTILISÉ"
echo "     MODE CLOUD UNIQUEMENT"
echo "================================"
echo ""
echo "L'application utilise l'IA en mode cloud uniquement."
echo "Aucune installation locale n'est nécessaire."
echo ""
echo "URL d'accès: $APP_URL"
echo ""
echo "Appuyez sur Ctrl+C pour quitter."
echo "================================"
echo ""

# Attendre que l'utilisateur appuie sur Ctrl+C
trap "kill $SERVER_PID; echo ''; echo 'Fermeture de FileChat...'; exit 0" INT
wait $SERVER_PID
