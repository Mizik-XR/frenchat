
#!/bin/bash

echo "==================================================="
echo "        DÉMARRAGE UNIVERSEL DE FILECHAT"
echo "==================================================="
echo ""

# Définir les couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Détection du mode optimal
USE_OLLAMA=0
USE_PYTHON=0
USE_CLOUD=1

# Vérification d'Ollama (prioritaire)
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    USE_OLLAMA=1
    echo -e "${GREEN}[DÉTECTÉ]${NC} Ollama est actif sur ce système."
    echo "           Le mode IA locale via Ollama sera disponible."
else
    echo -e "${BLUE}[INFO]${NC} Ollama n'est pas en cours d'exécution."
    echo "        L'IA locale via Ollama ne sera pas disponible."
fi
echo ""

# Vérification de Python et Hugging Face
PYTHON_CMD=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

if [ -n "$PYTHON_CMD" ]; then
    if $PYTHON_CMD -c "import transformers" >/dev/null 2>&1; then
        USE_PYTHON=1
        echo -e "${GREEN}[DÉTECTÉ]${NC} Python avec Hugging Face Transformers est disponible."
        echo "           Le mode IA locale via Python sera disponible."
    else
        echo -e "${BLUE}[INFO]${NC} Python est installé mais la bibliothèque transformers n'est pas détectée."
        echo "        L'IA locale via Python ne sera pas disponible."
    fi
else
    echo -e "${BLUE}[INFO]${NC} Python n'est pas détecté sur ce système."
    echo "        L'IA locale via Python ne sera pas disponible."
fi
echo ""

# Option pour forcer la reconstruction
FORCE_REBUILD=0
if [ "$1" == "--rebuild" ]; then
    FORCE_REBUILD=1
    echo -e "${BLUE}[INFO]${NC} Option de reconstruction forcée activée"
fi

# Animation de chargement
echo "Préparation de FileChat en cours..."
for ((i=1; i<=20; i++)); do
    echo -n "█"
    sleep 0.05
done
echo -e " ${GREEN}OK!${NC}"
echo ""

# Vérification du dossier dist
if [ ! -d "dist" ] || [ "$FORCE_REBUILD" == "1" ]; then
    echo -e "${BLUE}[INFO]${NC} Construction de l'application en cours..."
    rm -rf dist 2>/dev/null
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR]${NC} Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Application construite avec succès."
    echo ""
fi

# Vérification du fichier index.html dans dist
if [ ! -f "dist/index.html" ]; then
    echo -e "${YELLOW}[ATTENTION]${NC} Le fichier 'dist/index.html' est manquant."
    echo -e "${BLUE}[INFO]${NC} Reconstruction de l'application en cours..."
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR]${NC} Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Application construite avec succès."
    echo ""
fi

# Vérifier si http-server est installé
USE_NPX=0
if ! command -v http-server >/dev/null 2>&1; then
    echo -e "${BLUE}[INFO]${NC} Installation du serveur web..."
    npm install -g http-server >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}[ATTENTION]${NC} Installation de http-server échouée."
        echo "         Utilisation de npx comme alternative..."
        USE_NPX=1
    fi
fi

# Configuration des variables d'environnement
export CLIENT_MODE=1
export FORCE_CLOUD_MODE=0
export VITE_ENVIRONMENT=development
export VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk

if [ $USE_OLLAMA -eq 0 ] && [ $USE_PYTHON -eq 0 ]; then
    export FORCE_CLOUD_MODE=1
    echo -e "${BLUE}[INFO]${NC} Mode cloud forcé (aucune IA locale détectée)."
fi

# Démarrage des services nécessaires
echo -e "${BLUE}[INFO]${NC} Démarrage des services..."

if [ $USE_PYTHON -eq 1 ]; then
    echo -e "${BLUE}[INFO]${NC} Démarrage du serveur d'IA en Python..."
    $PYTHON_CMD serve_model.py > /dev/null 2>&1 &
    PYTHON_PID=$!
    sleep 2
fi

echo -e "${BLUE}[INFO]${NC} Démarrage du serveur web..."
if [ $USE_NPX -eq 1 ]; then
    npx http-server dist -p 8080 -c-1 --cors > /dev/null 2>&1 &
else
    http-server dist -p 8080 -c-1 --cors > /dev/null 2>&1 &
fi
SERVER_PID=$!
sleep 2

# Construction de l'URL avec les paramètres appropriés
APP_URL="http://localhost:8080"

# Ouvrir le navigateur
echo -e "${BLUE}[INFO]${NC} Ouverture de FileChat dans votre navigateur..."
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
echo "L'application est maintenant accessible sur:"
echo ""
echo -e "${GREEN}$APP_URL${NC}"
echo ""
echo "Fonctionnalités disponibles:"

if [ $USE_OLLAMA -eq 1 ]; then
    echo -e "${GREEN}[✓]${NC} Mode IA locale via Ollama"
fi
if [ $USE_PYTHON -eq 1 ]; then
    echo -e "${GREEN}[✓]${NC} Mode IA locale via Python"
fi
echo -e "${GREEN}[✓]${NC} Mode cloud"

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
