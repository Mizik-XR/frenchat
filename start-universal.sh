
#!/bin/bash

# Définition des couleurs pour le terminal
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}    ASSISTANT FILECHAT - INSTALLATION ET DÉMARRAGE   ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour ouvrir une URL selon le système d'exploitation
open_url() {
    URL="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux avec différentes options
        if command_exists xdg-open; then
            xdg-open "$URL" >/dev/null 2>&1
        elif command_exists gnome-open; then
            gnome-open "$URL" >/dev/null 2>&1
        elif command_exists gio; then
            gio open "$URL" >/dev/null 2>&1
        else
            echo -e "${YELLOW}[INFO] Veuillez ouvrir manuellement: $URL${NC}"
        fi
    else
        echo -e "${YELLOW}[INFO] Veuillez ouvrir manuellement: $URL${NC}"
    fi
}

# Étape 1: Analyse du système
echo -e "${BLUE}[ÉTAPE 1/4] Analyse du système et des dépendances...${NC}"
echo ""

# Variables pour le mode d'exécution
USE_OLLAMA=0
USE_PYTHON=0
USE_CLOUD=1
OLLAMA_DETECTED=0
PYTHON_DETECTED=0
PYTHON_VER=""
TRANSFORMERS_AVAILABLE=0

# Vérification d'Ollama
echo -e "${BLUE}[VÉRIFICATION] Recherche d'Ollama...${NC}"
if command_exists ollama; then
    OLLAMA_DETECTED=1
    echo -e "${GREEN}[OK] Ollama est installé sur ce système.${NC}"
else
    # Vérifier si Ollama est en cours d'exécution sur le port 11434
    if command_exists lsof; then
        if lsof -iTCP:11434 -sTCP:LISTEN >/dev/null 2>&1; then
            OLLAMA_DETECTED=1
            echo -e "${GREEN}[OK] Ollama est détecté comme service actif.${NC}"
        else
            echo -e "${YELLOW}[INFO] Ollama n'est pas installé ou n'est pas en cours d'exécution.${NC}"
        fi
    elif command_exists netstat; then
        if netstat -tuln | grep ":11434" >/dev/null 2>&1; then
            OLLAMA_DETECTED=1
            echo -e "${GREEN}[OK] Ollama est détecté comme service actif.${NC}"
        else
            echo -e "${YELLOW}[INFO] Ollama n'est pas installé ou n'est pas en cours d'exécution.${NC}"
        fi
    else
        echo -e "${YELLOW}[INFO] Impossible de vérifier si Ollama est en cours d'exécution.${NC}"
    fi
fi

# Vérification de Python
echo -e "${BLUE}[VÉRIFICATION] Recherche de Python...${NC}"

for cmd in python3 python; do
    if command_exists $cmd; then
        PYTHON_VER=$($cmd --version 2>&1 | cut -d' ' -f2)
        PYTHON_DETECTED=1
        PYTHON_CMD=$cmd
        echo -e "${GREEN}[OK] Python $PYTHON_VER est installé ($PYTHON_CMD).${NC}"
        
        echo -e "${BLUE}[VÉRIFICATION] Recherche de la bibliothèque Transformers...${NC}"
        if $PYTHON_CMD -c "import transformers" >/dev/null 2>&1; then
            TRANSFORMERS_AVAILABLE=1
            echo -e "${GREEN}[OK] La bibliothèque Transformers est installée.${NC}"
        else
            echo -e "${YELLOW}[INFO] La bibliothèque Transformers n'est pas installée.${NC}"
        fi
        break
    fi
done

if [ $PYTHON_DETECTED -eq 0 ]; then
    echo -e "${YELLOW}[INFO] Python n'est pas installé ou n'est pas dans le PATH.${NC}"
fi

# Configuration du mode d'exécution optimal
if [ $OLLAMA_DETECTED -eq 1 ]; then
    USE_OLLAMA=1
    echo -e "${GREEN}[DÉCISION] Mode IA locale via Ollama sélectionné comme prioritaire.${NC}"
elif [ $PYTHON_DETECTED -eq 1 ]; then
    if [ $TRANSFORMERS_AVAILABLE -eq 1 ]; then
        USE_PYTHON=1
        echo -e "${GREEN}[DÉCISION] Mode IA locale via Python sélectionné.${NC}"
    else
        USE_CLOUD=1
        echo -e "${YELLOW}[DÉCISION] Mode cloud sélectionné (Python détecté sans Transformers).${NC}"
    fi
else
    USE_CLOUD=1
    echo -e "${YELLOW}[DÉCISION] Mode cloud sélectionné (aucune IA locale disponible).${NC}"
fi

echo ""

# Étape 2: Installation des composants manquants
echo -e "${BLUE}[ÉTAPE 2/4] Installation des composants nécessaires...${NC}"
echo ""

# Proposition d'installation d'Ollama si non détecté
if [ $OLLAMA_DETECTED -eq 0 ]; then
    echo -e "${YELLOW}[QUESTION] Souhaitez-vous installer Ollama pour utiliser l'IA en local ?${NC}"
    echo "          Cela offre une meilleure confidentialité et performance."
    echo "          1. Oui, installer Ollama"
    echo "          2. Non, utiliser le mode cloud"
    read -p "Votre choix (1/2): " INSTALL_OLLAMA
    
    if [ "$INSTALL_OLLAMA" = "1" ]; then
        echo -e "${BLUE}[ACTION] Téléchargement d'Ollama en cours...${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open_url "https://ollama.ai/download/mac"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            open_url "https://ollama.ai/download/linux"
        else
            open_url "https://ollama.ai/download"
        fi
        
        echo -e "${YELLOW}[INFO] Une fois l'installation terminée, relancez ce script.${NC}"
        echo -e "${YELLOW}[INFO] Appuyez sur Entrée pour quitter...${NC}"
        read
        exit 0
    else
        echo -e "${YELLOW}[INFO] Installation d'Ollama ignorée, utilisation du mode cloud.${NC}"
    fi
    echo ""
fi

# Étape 3: Préparation de l'application
echo -e "${BLUE}[ÉTAPE 3/4] Préparation de l'application FileChat...${NC}"
echo ""

# Vérification de Node.js et npm
echo -e "${BLUE}[VÉRIFICATION] Recherche de Node.js...${NC}"
if ! command_exists node; then
    echo -e "${RED}[ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH.${NC}"
    echo -e "${YELLOW}[INFO] Veuillez installer Node.js depuis https://nodejs.org/${NC}"
    echo -e "${YELLOW}[INFO] Appuyez sur Entrée pour quitter...${NC}"
    read
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}[OK] Node.js $NODE_VERSION est installé.${NC}"
fi

# Vérification si l'application est déjà construite
if [ ! -d "dist" ]; then
    echo -e "${BLUE}[ACTION] Construction de l'application en cours...${NC}"
    
    # Vérification des modules node
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}[ACTION] Installation des dépendances Node.js...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] Installation des dépendances échouée${NC}"
            echo -e "${YELLOW}[INFO] Appuyez sur Entrée pour quitter...${NC}"
            read
            exit 1
        fi
    fi
    
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR] Construction de l'application échouée${NC}"
        echo -e "${YELLOW}[INFO] Appuyez sur Entrée pour quitter...${NC}"
        read
        exit 1
    fi
    echo -e "${GREEN}[OK] Application construite avec succès.${NC}"
else
    echo -e "${GREEN}[OK] Application déjà construite.${NC}"
fi

echo ""

# Étape 4: Démarrage des services
echo -e "${BLUE}[ÉTAPE 4/4] Démarrage des services...${NC}"
echo ""

# Variables pour les PIDs des processus
OLLAMA_PID=""
PYTHON_PID=""
SERVER_PID=""

# Démarrage d'Ollama si disponible et non démarré
if [ $USE_OLLAMA -eq 1 ]; then
    # Vérifier si Ollama est en cours d'exécution
    OLLAMA_RUNNING=0
    if command_exists lsof; then
        if lsof -iTCP:11434 -sTCP:LISTEN >/dev/null 2>&1; then
            OLLAMA_RUNNING=1
        fi
    elif command_exists netstat; then
        if netstat -tuln | grep ":11434" >/dev/null 2>&1; then
            OLLAMA_RUNNING=1
        fi
    fi
    
    if [ $OLLAMA_RUNNING -eq 0 ]; then
        echo -e "${BLUE}[ACTION] Démarrage d'Ollama...${NC}"
        if command_exists ollama; then
            ollama serve >/dev/null 2>&1 &
            OLLAMA_PID=$!
            sleep 5
        else
            echo -e "${YELLOW}[INFO] La commande ollama n'est pas disponible. Veuillez démarrer Ollama manuellement.${NC}"
        fi
    else
        echo -e "${GREEN}[OK] Ollama est déjà en cours d'exécution.${NC}"
    fi
    
    # Vérification du modèle Mistral
    echo -e "${BLUE}[VÉRIFICATION] Vérification du modèle Mistral dans Ollama...${NC}"
    if command_exists ollama; then
        if ! ollama list 2>/dev/null | grep -q "mistral"; then
            echo -e "${BLUE}[ACTION] Téléchargement du modèle Mistral (cela peut prendre quelques minutes)...${NC}"
            # Démarrer le téléchargement en arrière-plan
            (ollama pull mistral:latest && echo -e "${GREEN}Modèle téléchargé avec succès!${NC}") &
            echo -e "${YELLOW}[INFO] Le téléchargement du modèle continue en arrière-plan.${NC}"
        else
            echo -e "${GREEN}[OK] Modèle Mistral déjà téléchargé.${NC}"
        fi
    else
        echo -e "${YELLOW}[INFO] Impossible de vérifier les modèles Ollama.${NC}"
    fi
fi

# Démarrage du serveur Python si nécessaire
if [ $USE_PYTHON -eq 1 ]; then
    echo -e "${BLUE}[ACTION] Démarrage du serveur IA en Python...${NC}"
    
    # Création de l'environnement virtuel si nécessaire
    if [ ! -d "venv" ]; then
        echo -e "${BLUE}[ACTION] Création de l'environnement virtuel Python...${NC}"
        $PYTHON_CMD -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Démarrage du serveur Python
    python serve_model.py >/dev/null 2>&1 &
    PYTHON_PID=$!
    sleep 2
    echo -e "${GREEN}[OK] Serveur Python démarré avec PID $PYTHON_PID${NC}"
fi

# Démarrage du serveur web
echo -e "${BLUE}[ACTION] Démarrage du serveur web...${NC}"
if command_exists http-server; then
    http-server dist -p 8080 -c-1 --cors >/dev/null 2>&1 &
    SERVER_PID=$!
else
    # Installation si nécessaire
    echo -e "${BLUE}[ACTION] Installation du serveur web...${NC}"
    if command_exists npx; then
        npx http-server dist -p 8080 -c-1 --cors >/dev/null 2>&1 &
        SERVER_PID=$!
    else
        echo -e "${YELLOW}[INFO] Installation du serveur web...${NC}"
        npm install -g http-server >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            http-server dist -p 8080 -c-1 --cors >/dev/null 2>&1 &
            SERVER_PID=$!
        else
            echo -e "${RED}[ERREUR] Impossible d'installer ou de démarrer le serveur web${NC}"
            echo -e "${YELLOW}[INFO] Appuyez sur Entrée pour quitter...${NC}"
            read
            exit 1
        fi
    fi
fi

sleep 2
echo -e "${GREEN}[OK] Serveur web démarré avec PID $SERVER_PID${NC}"

# Construction de l'URL avec les paramètres appropriés
APP_URL="http://localhost:8080/?"

if [ $USE_OLLAMA -eq 1 ]; then
    APP_URL="${APP_URL}client=true&aiServiceType=local&localProvider=ollama&localAIUrl=http://localhost:11434"
elif [ $USE_PYTHON -eq 1 ]; then
    APP_URL="${APP_URL}client=true&aiServiceType=local&localProvider=transformers&localAIUrl=http://localhost:8000"
else
    APP_URL="${APP_URL}client=true&forceCloud=true"
fi

# Ouvrir le navigateur
echo -e "${BLUE}[ACTION] Ouverture de FileChat dans votre navigateur...${NC}"
open_url "$APP_URL"

echo ""
echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}       FILECHAT EST PRÊT À ÊTRE UTILISÉ            ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""
echo "L'application est maintenant accessible avec:"
echo ""

if [ $USE_OLLAMA -eq 1 ]; then
    echo -e "${GREEN}[✓] Mode IA locale via Ollama${NC}"
elif [ $USE_PYTHON -eq 1 ]; then
    echo -e "${GREEN}[✓] Mode IA locale via Python${NC}"
else
    echo -e "${GREEN}[✓] Mode cloud${NC}"
fi

echo ""
echo -e "URL d'accès: ${BLUE}$APP_URL${NC}"
echo ""
echo "Cette fenêtre peut être minimisée. Ne la fermez pas tant que"
echo "vous utilisez FileChat."
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour quitter.${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Fonction de nettoyage à la sortie
cleanup() {
    echo ""
    echo -e "${BLUE}Fermeture de FileChat...${NC}"
    [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
    [ -n "$PYTHON_PID" ] && kill $PYTHON_PID 2>/dev/null
    [ -n "$OLLAMA_PID" ] && kill $OLLAMA_PID 2>/dev/null
    exit 0
}

# Intercepter Ctrl+C pour nettoyer proprement
trap cleanup INT TERM

# Attendre indéfiniment
wait
