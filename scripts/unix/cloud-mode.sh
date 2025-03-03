
#!/bin/bash

echo "==================================================="
echo "     FILECHAT - MODE CLOUD"
echo "==================================================="
echo ""
echo "Cette version démarre FileChat en mode cloud uniquement,"
echo "sans nécessiter de serveur IA local."
echo ""

# Vérification de http-server
if ! command -v http-server &> /dev/null; then
    echo "[INFO] Installation de http-server..."
    npm install -g http-server
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Échec de l'installation de http-server."
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
    echo "[OK] http-server installé."
else
    echo "[OK] http-server est déjà installé."
fi

# Démarrage du serveur HTTP
echo "[INFO] Démarrage du serveur HTTP..."
http-server dist -p 8080 --cors -c-1 &
HTTP_PID=$!
echo "[OK] Serveur HTTP démarré (PID: $HTTP_PID)."
echo ""

# Ouverture du navigateur
sleep 1
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
elif command -v open &> /dev/null; then
    open "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
else
    echo "[INFO] Veuillez ouvrir manuellement: http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
fi

echo ""
echo "==================================================="
echo "         FILECHAT DÉMARRÉ EN MODE CLOUD"
echo "==================================================="
echo ""
echo "Application Web: http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
echo ""
echo "Pour arrêter le service, appuyez sur Ctrl+C"
echo ""

# Gérer l'interruption
cleanup() {
    echo "Arrêt du service..."
    kill $HTTP_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Garder le script en vie
while true; do
    sleep 1
done
