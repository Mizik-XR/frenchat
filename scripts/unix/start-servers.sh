
#!/bin/bash

SERVER_PID=$1
WEB_PORT=8080

# Démarrage d'un serveur HTTP simple
echo "[INFO] Démarrage du serveur web..."
if ! command -v npx &> /dev/null; then
    npm install -g http-server
    http-server dist -p $WEB_PORT -c-1 &
else
    npx http-server dist -p $WEB_PORT -c-1 &
fi
WEB_PID=$!

# Ouvrir le navigateur
echo "[INFO] Ouverture du navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:$WEB_PORT
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:$WEB_PORT &>/dev/null || sensible-browser http://localhost:$WEB_PORT &>/dev/null || echo "[INFO] Veuillez ouvrir http://localhost:$WEB_PORT dans votre navigateur"
fi

echo ""
echo "================================"
echo "FILECHAT DÉMARRÉ AVEC SUCCÈS"
echo "================================"
echo ""
echo "Services disponibles:"
echo "[1] Serveur IA local: http://localhost:8000"
echo "[2] Application Web: http://localhost:$WEB_PORT"
echo ""
echo "[INFO] Pour arrêter les services, appuyez sur Ctrl+C"
echo ""

# Attendre que l'utilisateur arrête le script avec Ctrl+C
wait $SERVER_PID

# Nettoyer en fermant le serveur web si le serveur IA s'arrête
kill $WEB_PID 2>/dev/null
echo ""
echo "Services arrêtés avec succès"
exit 0
