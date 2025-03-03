
#!/bin/bash

echo "==================================================="
echo "        DÉMARRAGE UNIVERSEL DE FILECHAT"
echo "==================================================="
echo ""

# Détection du mode optimal
USE_OLLAMA=0
USE_PYTHON=0
USE_CLOUD=1

# Vérification d'Ollama (prioritaire)
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    USE_OLLAMA=1
    echo "[DÉTECTÉ] Ollama est actif sur ce système."
    echo "          Le mode IA locale via Ollama sera disponible."
else
    echo "[INFO] Ollama n'est pas en cours d'exécution."
    echo "       L'IA locale via Ollama ne sera pas disponible."
fi
echo ""

# Vérification de Python et Hugging Face
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

if [ -n "$PYTHON_CMD" ]; then
    if $PYTHON_CMD -c "import transformers" >/dev/null 2>&1; then
        USE_PYTHON=1
        echo "[DÉTECTÉ] Python avec Hugging Face Transformers est disponible."
        echo "          Le mode IA locale via Python sera disponible."
    else
        echo "[INFO] Python est installé mais la bibliothèque transformers n'est pas détectée."
        echo "       L'IA locale via Python ne sera pas disponible."
    fi
else
    echo "[INFO] Python n'est pas détecté sur ce système."
    echo "       L'IA locale via Python ne sera pas disponible."
fi
echo ""

# Animation de chargement
echo "Préparation de FileChat en cours..."
for ((i=1; i<=20; i++)); do
    echo -n "█"
    sleep 0.05
done
echo " OK!"
echo ""

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

# Vérifier si le script Lovable est présent dans index.html
if ! grep -q "gptengineer.js" "dist/index.html" 2>/dev/null; then
    echo "[ATTENTION] Le script Lovable manque dans dist/index.html."
    echo "             Application de la correction..."
    bash scripts/unix/fix-edit-issues.sh --silent
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Correction échouée, consultez le diagnostic complet."
        echo "          Utilisez scripts/unix/diagnostic.sh pour plus d'informations."
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] Correction appliquée."
    echo ""
fi

# Vérifier si http-server est installé
USE_NPX=0
if ! command -v http-server >/dev/null 2>&1; then
    echo "[INFO] Installation du serveur web..."
    npm install -g http-server >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation du serveur web échouée."
        echo "         Utilisation de npx comme alternative..."
        USE_NPX=1
    fi
fi

# Configuration des variables d'environnement
export CLIENT_MODE=1
export FORCE_CLOUD_MODE=0

if [ $USE_OLLAMA -eq 0 ] && [ $USE_PYTHON -eq 0 ]; then
    export FORCE_CLOUD_MODE=1
    echo "[INFO] Mode cloud forcé (aucune IA locale détectée)."
fi

# Démarrage des services nécessaires
echo "[INFO] Démarrage des services..."

if [ $USE_PYTHON -eq 1 ]; then
    echo "[INFO] Démarrage du serveur d'IA en Python..."
    $PYTHON_CMD serve_model.py > /dev/null 2>&1 &
    PYTHON_PID=$!
    sleep 2
fi

echo "[INFO] Démarrage du serveur web..."
if [ $USE_NPX -eq 1 ]; then
    npx http-server dist -p 8080 -c-1 --cors > /dev/null 2>&1 &
else
    http-server dist -p 8080 -c-1 --cors > /dev/null 2>&1 &
fi
SERVER_PID=$!
sleep 2

# Construction de l'URL avec les paramètres appropriés
if [ $FORCE_CLOUD_MODE -eq 1 ]; then
    APP_URL="http://localhost:8080/?client=true&hideDebug=true&forceCloud=true"
else
    APP_URL="http://localhost:8080/?client=true"
fi

# Ouvrir le navigateur
echo "[INFO] Ouverture de FileChat dans votre navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # MacOS
    open "$APP_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$APP_URL" >/dev/null 2>&1 || sensible-browser "$APP_URL" >/dev/null 2>&1 || echo "Veuillez ouvrir manuellement: $APP_URL"
fi

echo ""
echo "==================================================="
echo "       FILECHAT EST PRÊT À ÊTRE UTILISÉ"
echo "==================================================="
echo ""
echo "L'application est maintenant accessible avec:"
echo ""

if [ $USE_OLLAMA -eq 1 ]; then
    echo "[✓] Mode IA locale via Ollama"
fi
if [ $USE_PYTHON -eq 1 ]; then
    echo "[✓] Mode IA locale via Python"
fi
echo "[✓] Mode cloud"

echo ""
echo "URL d'accès: $APP_URL"
echo ""
echo "Cette fenêtre peut être minimisée. Ne la fermez pas tant que"
echo "vous utilisez FileChat."
echo ""
echo "Appuyez sur Ctrl+C pour quitter."
echo "==================================================="
echo ""

# Attendre que l'utilisateur arrête le script avec Ctrl+C
trap "echo ''; echo 'Fermeture de FileChat...'; [ -n \"$PYTHON_PID\" ] && kill $PYTHON_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; exit 0" INT
wait
