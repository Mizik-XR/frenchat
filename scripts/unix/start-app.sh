
#!/bin/bash

echo "==================================================="
echo "     DÉMARRAGE DE FILECHAT"
echo "==================================================="
echo ""

# Vérification des prérequis
echo "[ÉTAPE 1/3] Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé. Téléchargez-le sur https://nodejs.org/"
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
else
    NODE_VERSION=$(node -v)
    echo "  [OK] Node.js $NODE_VERSION est installé."
fi

if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[ERREUR] Python n'est pas installé. Téléchargez-le sur https://www.python.org/"
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi
PYTHON_VERSION=$($PYTHON_CMD --version)
echo "  [OK] $PYTHON_VERSION est installé."
echo ""

# Démarrage du backend (API)
echo "[ÉTAPE 2/3] Démarrage du serveur IA..."
if [ ! -f "serve_model.py" ]; then
    echo "[ERREUR] Le fichier serve_model.py est introuvable."
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

$PYTHON_CMD serve_model.py &
API_PID=$!
echo "  [OK] Serveur IA démarré (PID: $API_PID)."
echo ""

# Démarrage du frontend
echo "[ÉTAPE 3/3] Démarrage du frontend..."
if ! command -v http-server &> /dev/null; then
    echo "  [INFO] Installation de http-server..."
    npm install -g http-server
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Échec de l'installation de http-server."
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
    echo "  [OK] http-server installé."
else
    echo "  [OK] http-server est déjà installé."
fi

http-server dist -p 8080 --cors -c-1 &
HTTP_PID=$!
echo "  [OK] Serveur HTTP démarré (PID: $HTTP_PID)."
echo ""

# Ouverture du navigateur
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
elif command -v open &> /dev/null; then
    open "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
else
    echo "  [INFO] Veuillez ouvrir manuellement: http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
fi

echo ""
echo "==================================================="
echo "         FILECHAT DÉMARRÉ AVEC SUCCÈS"
echo "==================================================="
echo ""
echo "Services disponibles:"
echo "[1] Serveur IA local: http://localhost:8000"
echo "[2] Application Web: http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"
echo ""
echo "Pour arrêter les services, appuyez sur Ctrl+C"
echo ""

# Gérer l'interruption
cleanup() {
    echo "Arrêt des services..."
    kill $API_PID 2>/dev/null
    kill $HTTP_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Garder le script en vie
while true; do
    sleep 1
done
