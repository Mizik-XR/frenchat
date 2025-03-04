
#!/bin/bash

# Définition des couleurs pour une meilleure lisibilité
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}==================================================="
echo "      ASSISTANT AUTOMATIQUE FILECHAT v1.0"
echo -e "===================================================${NC}"
echo

MENU_PRINCIPAL() {
    echo "Ce script va automatiser toutes les opérations nécessaires"
    echo "au fonctionnement optimal de FileChat en local."
    echo
    echo "[1] Nettoyage et Configuration Complète (recommandé)"
    echo "[2] Démarrage Rapide (si déjà configuré)"
    echo "[3] Mode de Secours (en cas de problème)"
    echo "[4] Diagnostics et Résolution Automatique"
    echo "[5] Aide et Documentation"
    echo "[0] Quitter"
    echo
    echo -e "${BLUE}==================================================${NC}"
    echo
    read -p "Votre choix: " CHOIX

    case $CHOIX in
        1) NETTOYAGE_COMPLET ;;
        2) DEMARRAGE_RAPIDE ;;
        3) MODE_SECOURS ;;
        4) DIAGNOSTICS ;;
        5) AIDE ;;
        0) FIN ;;
        *) 
            echo -e "${RED}[ERREUR] Choix non valide${NC}"
            sleep 1
            clear
            MENU_PRINCIPAL 
            ;;
    esac
}

NETTOYAGE_COMPLET() {
    clear
    echo -e "${BLUE}==================================================="
    echo "      NETTOYAGE ET CONFIGURATION COMPLÈTE"
    echo -e "===================================================${NC}"
    echo
    echo "Étapes à effectuer :"
    echo "[1] Vérification de l'environnement"
    echo "[2] Nettoyage des caches et dossiers temporaires"
    echo "[3] Réinstallation des dépendances"
    echo "[4] Construction de l'application"
    echo "[5] Configuration optimale pour votre système"
    echo
    echo "Cette opération peut prendre plusieurs minutes."
    echo
    read -p "Voulez-vous continuer? [O/N]: " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Oo]$ ]]; then
        clear
        MENU_PRINCIPAL
        return
    fi

    # Vérification de l'environnement
    echo
    echo -e "${YELLOW}[1/5] Vérification de l'environnement...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERREUR] Node.js n'est pas installé ou n'est pas dans votre PATH.${NC}"
        echo "          Veuillez installer Node.js depuis https://nodejs.org/"
        read -p "Appuyez sur Entrée pour continuer..."
        clear
        MENU_PRINCIPAL
        return
    else
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}[OK] Node.js ${NODE_VERSION} détecté${NC}"
    fi

    # Analyse du système
    echo
    echo -e "${YELLOW}[INFO] Analyse de votre système...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        CPU_INFO=$(sysctl -n machdep.cpu.brand_string)
        MEMORY_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
        if system_profiler SPDisplaysDataType | grep -q "NVIDIA"; then
            GPU_INFO="NVIDIA GPU"
            USE_GPU=1
        elif system_profiler SPDisplaysDataType | grep -q "AMD"; then
            GPU_INFO="AMD GPU"
            USE_GPU=0
        else
            GPU_INFO="Intel/Apple GPU"
            USE_GPU=0
        fi
    else
        # Linux
        CPU_INFO=$(grep "model name" /proc/cpuinfo | head -1 | cut -d ':' -f2 | sed 's/^[ \t]*//')
        MEMORY_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1048576 ))
        if lspci | grep -i nvidia &> /dev/null; then
            GPU_INFO="NVIDIA GPU"
            USE_GPU=1
        elif lspci | grep -i amd &> /dev/null; then
            GPU_INFO="AMD GPU"
            USE_GPU=0
        else
            GPU_INFO="Integrated/Other GPU"
            USE_GPU=0
        fi
    fi

    echo -e "${YELLOW}[INFO] CPU: ${CPU_INFO}${NC}"
    echo -e "${YELLOW}[INFO] RAM: ${MEMORY_GB} GB${NC}"
    echo -e "${YELLOW}[INFO] GPU: ${GPU_INFO}${NC}"

    # Définir les options en fonction du matériel
    if [[ $MEMORY_GB -ge 16 ]]; then
        HIGH_MEMORY=1
    else
        HIGH_MEMORY=0
    fi

    # Nettoyage des dossiers
    echo
    echo -e "${YELLOW}[2/5] Nettoyage des caches et dossiers temporaires...${NC}"
    if [ -d "node_modules" ]; then
        echo "[INFO] Suppression de node_modules..."
        rm -rf node_modules
    fi
    if [ -d "dist" ]; then
        echo "[INFO] Suppression de dist..."
        rm -rf dist
    fi
    if [ -d ".vite" ]; then
        echo "[INFO] Suppression du cache Vite..."
        rm -rf .vite
    fi
    if [ -d ".netlify" ]; then
        echo "[INFO] Suppression du cache Netlify..."
        rm -rf .netlify
    fi
    npm cache clean --force
    echo -e "${GREEN}[OK] Nettoyage terminé${NC}"

    # Réinstallation des dépendances
    echo
    echo -e "${YELLOW}[3/5] Réinstallation des dépendances...${NC}"
    if [[ $HIGH_MEMORY -eq 1 ]]; then
        export NODE_OPTIONS="--max-old-space-size=8192"
    else
        export NODE_OPTIONS="--max-old-space-size=4096"
    fi
    echo "[INFO] Installation avec NODE_OPTIONS=${NODE_OPTIONS}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR] Installation des dépendances échouée${NC}"
        echo "[INFO] Tentative avec des options alternatives..."
        export NO_RUST_INSTALL=1
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] L'installation a échoué même avec des options alternatives${NC}"
            read -p "Appuyez sur Entrée pour continuer..."
            clear
            MENU_PRINCIPAL
            return
        fi
    fi
    echo -e "${GREEN}[OK] Dépendances installées avec succès${NC}"

    # Construction de l'application
    echo
    echo -e "${YELLOW}[4/5] Construction de l'application...${NC}"
    npm run build > build-log.txt 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR] Construction échouée${NC}"
        echo "[INFO] Tentative de correction automatique..."
        
        # Vérifier si le problème est lié au noscript
        if grep -q "disallowed-content-in-noscript-in-head" build-log.txt; then
            echo "[INFO] Correction du problème de noscript dans index.html..."
            sed -i.bak 's/\(<head>.*\)\(<noscript>.*<\/noscript>\)\(.*<\/head>\)/\1\3\n<body>\2/' index.html
            npm run build
        fi
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] La construction a échoué malgré les tentatives de correction${NC}"
            echo "[INFO] Essayez le Mode de Secours depuis le menu principal"
            read -p "Appuyez sur Entrée pour continuer..."
            clear
            MENU_PRINCIPAL
            return
        fi
    fi
    echo -e "${GREEN}[OK] Application construite avec succès${NC}"

    # Configuration optimale
    echo
    echo -e "${YELLOW}[5/5] Configuration optimale pour votre système...${NC}"
    cat > .env.local << EOF
VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
EOF

    if [[ $USE_GPU -eq 1 ]]; then
        echo "VITE_USE_GPU=true" >> .env.local
        echo "VITE_ENABLE_HARDWARE_ACCELERATION=true" >> .env.local
    fi
    if [[ $HIGH_MEMORY -eq 1 ]]; then
        echo "VITE_HIGH_MEMORY=true" >> .env.local
    fi
    echo -e "${GREEN}[OK] Configuration terminée${NC}"

    # Vérification script gptengineer.js
    echo
    echo -e "${YELLOW}[INFO] Vérification du script Lovable...${NC}"
    if [ -f "dist/index.html" ]; then
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "[ATTENTION] Le script Lovable manque dans index.html."
            echo "[INFO] Application d'une correction automatique..."
            sed -i.bak 's/<script /<script src="https:\/\/cdn.gpteng.co\/gptengineer.js" type="module"><\/script>\n    &/' dist/index.html
            echo -e "${GREEN}[OK] Script Lovable ajouté.${NC}"
        else
            echo -e "${GREEN}[OK] Script Lovable déjà présent.${NC}"
        fi
    fi

    echo
    echo -e "${BLUE}==================================================="
    echo "    NETTOYAGE ET CONFIGURATION TERMINÉS AVEC SUCCÈS"
    echo -e "===================================================${NC}"
    echo
    echo "Sélectionnez une option pour continuer:"
    echo "[1] Démarrer FileChat maintenant"
    echo "[2] Retourner au menu principal"
    echo
    read -p "Votre choix: " NEXT_STEP

    if [[ "$NEXT_STEP" == "1" ]]; then
        clear
        DEMARRAGE_RAPIDE
    else
        clear
        MENU_PRINCIPAL
    fi
}

DEMARRAGE_RAPIDE() {
    clear
    echo -e "${BLUE}==================================================="
    echo "         DÉMARRAGE RAPIDE DE FILECHAT"
    echo -e "===================================================${NC}"
    echo
    echo "Options de démarrage:"
    echo "[1] Mode standard avec IA locale (si disponible)"
    echo "[2] Mode cloud uniquement (plus léger)"
    echo "[3] Mode développeur (avec logs détaillés)"
    echo "[0] Retour au menu principal"
    echo
    read -p "Votre choix: " START_MODE

    case $START_MODE in
        0) 
            clear
            MENU_PRINCIPAL
            ;;
        1) START_STANDARD ;;
        2) START_CLOUD ;;
        3) START_DEV ;;
        *)
            echo -e "${RED}[ERREUR] Choix non valide${NC}"
            sleep 1
            DEMARRAGE_RAPIDE
            ;;
    esac
}

START_STANDARD() {
    echo
    echo -e "${YELLOW}[INFO] Démarrage de FileChat en mode standard...${NC}"

    # Vérifier si Ollama est disponible
    OLLAMA_AVAILABLE=0
    if lsof -Pi :11434 -sTCP:LISTEN >/dev/null 2>&1; then
        OLLAMA_AVAILABLE=1
    fi

    # Vérifier si le dossier dist existe
    if [ ! -d "dist" ]; then
        echo "[INFO] Le dossier dist n'existe pas, construction de l'application..."
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] Construction échouée${NC}"
            echo "[INFO] Tentative de démarrage en mode de secours..."
            bash start-fallback-mode.sh
            exit 0
        fi
    fi

    # Vérifier si http-server est installé
    if ! command -v http-server &> /dev/null; then
        echo "[INFO] Installation de http-server..."
        npm install -g http-server
    fi

    echo
    echo -e "${YELLOW}[INFO] Démarrage des services...${NC}"

    # Démarrage du serveur IA si Ollama est disponible
    if [[ $OLLAMA_AVAILABLE -eq 1 ]]; then
        echo "[INFO] Ollama détecté, activation de l'IA locale..."
        if [ -f "serve_model.py" ]; then
            source venv/bin/activate
            python serve_model.py &
            SERVER_PID=$!
            sleep 3
        else
            echo -e "${YELLOW}[ATTENTION] Fichier serve_model.py non trouvé, IA locale désactivée${NC}"
        fi
    fi

    # Démarrage du serveur web
    http-server dist -p 8080 -c-1 --cors &
    HTTP_PID=$!
    sleep 2

    # Ouvrir le navigateur
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:8080
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:8080 &>/dev/null || sensible-browser http://localhost:8080 &>/dev/null || echo "Veuillez ouvrir http://localhost:8080 dans votre navigateur"
    fi

    echo
    echo -e "${BLUE}==================================================="
    echo "    FILECHAT DÉMARRÉ AVEC SUCCÈS"
    echo -e "===================================================${NC}"
    echo
    echo "Services actifs:"
    if [[ $OLLAMA_AVAILABLE -eq 1 ]]; then
        echo -e "${GREEN}[IA] Serveur IA local - http://localhost:8000${NC}"
    fi
    echo -e "${GREEN}[WEB] Application web - http://localhost:8080${NC}"
    echo
    echo "Cette fenêtre peut être minimisée. Ne la fermez pas"
    echo "tant que vous utilisez FileChat."
    echo
    echo "Appuyez sur Ctrl+C pour arrêter FileChat..."

    # Attendre que l'utilisateur interrompe le script
    trap "kill $HTTP_PID 2>/dev/null; if [[ \$OLLAMA_AVAILABLE -eq 1 ]]; then kill \$SERVER_PID 2>/dev/null; fi; echo ''; echo 'Fermeture de FileChat...'; clear; MENU_PRINCIPAL" INT
    wait
}

START_CLOUD() {
    echo
    echo -e "${YELLOW}[INFO] Démarrage de FileChat en mode cloud...${NC}"
    export MODE_CLOUD=1

    # Vérifier si le dossier dist existe
    if [ ! -d "dist" ]; then
        echo "[INFO] Le dossier dist n'existe pas, construction de l'application..."
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] Construction échouée${NC}"
            echo "[INFO] Tentative de démarrage en mode de secours..."
            bash start-fallback-mode.sh
            exit 0
        fi
    fi

    # Vérifier si http-server est installé
    if ! command -v http-server &> /dev/null; then
        echo "[INFO] Installation de http-server..."
        npm install -g http-server
    fi

    echo
    echo -e "${YELLOW}[INFO] Démarrage du serveur web...${NC}"
    http-server dist -p 8080 -c-1 --cors &
    HTTP_PID=$!
    sleep 2

    # Ouvrir le navigateur
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8080?mode=cloud"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://localhost:8080?mode=cloud" &>/dev/null || sensible-browser "http://localhost:8080?mode=cloud" &>/dev/null || echo "Veuillez ouvrir http://localhost:8080?mode=cloud dans votre navigateur"
    fi

    echo
    echo -e "${BLUE}==================================================="
    echo "    FILECHAT DÉMARRÉ EN MODE CLOUD AVEC SUCCÈS"
    echo -e "===================================================${NC}"
    echo
    echo "Services actifs:"
    echo -e "${GREEN}[WEB] Application web - http://localhost:8080?mode=cloud${NC}"
    echo
    echo "Cette fenêtre peut être minimisée. Ne la fermez pas"
    echo "tant que vous utilisez FileChat."
    echo
    echo "Appuyez sur Ctrl+C pour arrêter FileChat..."

    # Attendre que l'utilisateur interrompe le script
    trap "kill $HTTP_PID; echo ''; echo 'Fermeture de FileChat...'; clear; MENU_PRINCIPAL" INT
    wait
}

START_DEV() {
    echo
    echo -e "${YELLOW}[INFO] Démarrage de FileChat en mode développeur...${NC}"
    export VITE_DEBUG_MODE=1
    export DEV_MODE=1

    # Vérifier si le dossier dist existe
    if [ ! -d "dist" ]; then
        echo "[INFO] Le dossier dist n'existe pas, construction de l'application..."
        export NODE_OPTIONS="--max-old-space-size=4096"
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERREUR] Construction échouée${NC}"
            echo "[INFO] Tentative de démarrage en mode de secours..."
            bash start-fallback-mode.sh
            exit 0
        fi
    fi

    # Vérifier si http-server est installé
    if ! command -v http-server &> /dev/null; then
        echo "[INFO] Installation de http-server..."
        npm install -g http-server
    fi

    # Démarrage des serveurs en mode développeur
    echo
    echo -e "${YELLOW}[INFO] Démarrage des services en mode développeur...${NC}"

    # Vérifier si Ollama est disponible
    OLLAMA_AVAILABLE=0
    if lsof -Pi :11434 -sTCP:LISTEN >/dev/null 2>&1; then
        OLLAMA_AVAILABLE=1
    fi

    # Démarrage du serveur IA si disponible
    if [[ $OLLAMA_AVAILABLE -eq 1 ]]; then
        echo "[INFO] Ollama détecté, activation de l'IA locale..."
        if [ -f "serve_model.py" ]; then
            source venv/bin/activate
            DEBUG=true python serve_model.py &
            SERVER_PID=$!
            sleep 3
        else
            echo -e "${YELLOW}[ATTENTION] Fichier serve_model.py non trouvé, IA locale désactivée${NC}"
        fi
    fi

    # Démarrage du serveur web avec logs complets
    http-server dist -p 8080 -c-1 --cors --log-ip &
    HTTP_PID=$!
    sleep 2

    # Ouvrir le navigateur avec paramètres de debug
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8080?debug=true&show_logs=true&dev_mode=true"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://localhost:8080?debug=true&show_logs=true&dev_mode=true" &>/dev/null || 
        sensible-browser "http://localhost:8080?debug=true&show_logs=true&dev_mode=true" &>/dev/null || 
        echo "Veuillez ouvrir http://localhost:8080?debug=true&show_logs=true&dev_mode=true dans votre navigateur"
    fi

    echo
    echo -e "${BLUE}==================================================="
    echo "    FILECHAT DÉMARRÉ EN MODE DÉVELOPPEUR"
    echo -e "===================================================${NC}"
    echo
    echo "Services actifs:"
    if [[ $OLLAMA_AVAILABLE -eq 1 ]]; then
        echo -e "${GREEN}[IA] Serveur IA local (debug) - http://localhost:8000${NC}"
    fi
    echo -e "${GREEN}[WEB] Application web (debug) - http://localhost:8080?debug=true${NC}"
    echo
    echo "Mode développeur activé:"
    echo "- Logs détaillés dans la console"
    echo "- Panel de debug visible dans l'application"
    echo "- Traces réseau activées"
    echo
    echo "Cette fenêtre peut être minimisée. Ne la fermez pas"
    echo "tant que vous utilisez FileChat."
    echo
    echo "Appuyez sur Ctrl+C pour arrêter FileChat..."

    # Attendre que l'utilisateur interrompe le script
    trap "kill $HTTP_PID; if [[ \$OLLAMA_AVAILABLE -eq 1 ]]; then kill \$SERVER_PID 2>/dev/null; fi; echo ''; echo 'Fermeture de FileChat...'; clear; MENU_PRINCIPAL" INT
    wait
}

MODE_SECOURS() {
    clear
    echo -e "${BLUE}==================================================="
    echo "      DÉMARRAGE DE FILECHAT EN MODE DE SECOURS"
    echo -e "===================================================${NC}"
    echo
    echo "Le mode de secours désactive toutes les fonctionnalités"
    echo "avancées et utilise une configuration minimale pour"
    echo "assurer un fonctionnement fiable."
    echo
    echo "Options du mode de secours:"
    echo "[1] Mode de secours standard"
    echo "[2] Mode de secours avec réinitialisation complète"
    echo "[0] Retour au menu principal"
    echo
    read -p "Votre choix: " FALLBACK_MODE

    case $FALLBACK_MODE in
        0) 
            clear
            MENU_PRINCIPAL
            ;;
        2)
            echo
            echo -e "${YELLOW}[INFO] Réinitialisation complète en cours...${NC}"
            if [ -d "dist" ]; then rm -rf dist; fi
            if [ -d "node_modules" ]; then rm -rf node_modules; fi
            if [ -d ".vite" ]; then rm -rf .vite; fi
            npm cache clean --force
            npm install
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ERREUR] Réinstallation des dépendances échouée${NC}"
                echo "[INFO] Continuation en mode ultra-minimal..."
            fi
            ;;
    esac

    echo
    echo -e "${YELLOW}[INFO] Démarrage en mode de secours...${NC}"
    bash start-fallback-mode.sh
    echo
    read -p "Appuyez sur Entrée pour retourner au menu principal..."
    clear
    MENU_PRINCIPAL
}

DIAGNOSTICS() {
    clear
    echo -e "${BLUE}==================================================="
    echo "     DIAGNOSTICS ET RÉSOLUTION AUTOMATIQUE"
    echo -e "===================================================${NC}"
    echo
    echo -e "${YELLOW}[INFO] Analyse de l'environnement en cours...${NC}"

    # Vérification de l'environnement système
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        OS_INFO="macOS $(sw_vers -productVersion)"
        CPU_INFO=$(sysctl -n machdep.cpu.brand_string)
        MEMORY_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
        if system_profiler SPDisplaysDataType | grep -q "NVIDIA"; then
            GPU_INFO="NVIDIA GPU"
            USE_GPU=1
        elif system_profiler SPDisplaysDataType | grep -q "AMD"; then
            GPU_INFO="AMD GPU"
            USE_GPU=0
        else
            GPU_INFO="Intel/Apple GPU"
            USE_GPU=0
        fi
    else
        # Linux
        OS_INFO=$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)
        CPU_INFO=$(grep "model name" /proc/cpuinfo | head -1 | cut -d ':' -f2 | sed 's/^[ \t]*//')
        MEMORY_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1048576 ))
        if lspci | grep -i nvidia &> /dev/null; then
            GPU_INFO="NVIDIA GPU"
            USE_GPU=1
        elif lspci | grep -i amd &> /dev/null; then
            GPU_INFO="AMD GPU"
            USE_GPU=0
        else
            GPU_INFO="Integrated/Other GPU"
            USE_GPU=0
        fi
    fi

    echo -e "${YELLOW}[SYSTÈME] ${OS_INFO}${NC}"
    echo -e "${YELLOW}[CPU] ${CPU_INFO}${NC}"
    echo -e "${YELLOW}[RAM] ${MEMORY_GB} GB${NC}"
    echo -e "${YELLOW}[GPU] ${GPU_INFO}${NC}"
    echo

    # Tests de base
    echo -e "${YELLOW}[TEST] Vérification des fichiers essentiels...${NC}"
    MISSING_FILES=0
    if [ ! -f "index.html" ]; then MISSING_FILES=$((MISSING_FILES+1)); fi
    if [ ! -f "vite.config.ts" ]; then MISSING_FILES=$((MISSING_FILES+1)); fi
    if [ ! -f "package.json" ]; then MISSING_FILES=$((MISSING_FILES+1)); fi
    if [ ! -f "src/main.tsx" ]; then MISSING_FILES=$((MISSING_FILES+1)); fi

    if [ $MISSING_FILES -gt 0 ]; then
        echo -e "${RED}[PROBLÈME] ${MISSING_FILES} fichiers essentiels manquants.${NC}"
        echo -e "${YELLOW}[SOLUTION] Une réinstallation complète est recommandée.${NC}"
    else
        echo -e "${GREEN}[OK] Tous les fichiers essentiels sont présents.${NC}"
    fi

    # Vérification des services
    echo
    echo -e "${YELLOW}[TEST] Vérification des services...${NC}"
    OLLAMA_RUNNING=0
    if lsof -Pi :11434 -sTCP:LISTEN >/dev/null 2>&1; then
        OLLAMA_RUNNING=1
        echo -e "${GREEN}[OK] Service Ollama détecté et actif.${NC}"
    else
        echo -e "${YELLOW}[INFO] Service Ollama non détecté.${NC}"
        echo -e "${YELLOW}[SOLUTION] L'application utilisera le mode cloud par défaut.${NC}"
    fi

    # Vérification des problèmes courants
    echo
    echo -e "${YELLOW}[TEST] Recherche de problèmes courants...${NC}"

    # Problème de noscript
    if [ -f "index.html" ]; then
        if grep -q "<noscript>" index.html && grep -q "<head>" index.html; then
            if grep -A5 "<noscript>" index.html | grep -q "<div"; then
                echo -e "${RED}[PROBLÈME] Balise noscript mal placée dans index.html.${NC}"
                echo -e "${YELLOW}[SOLUTION] Correction automatique disponible.${NC}"
                
                read -p "Appliquer la correction? [O/N]: " FIX_NOSCRIPT
                if [[ "$FIX_NOSCRIPT" =~ ^[Oo]$ ]]; then
                    echo -e "${YELLOW}[INFO] Application de la correction...${NC}"
                    sed -i.bak 's/\(<head>.*\)\(<noscript>.*<\/noscript>\)\(.*<\/head>\)/\1\3\n<body>\2/' index.html
                    echo -e "${GREEN}[OK] Correction appliquée avec succès.${NC}"
                fi
            fi
        fi
    fi

    # Problème de script Lovable
    if [ -f "dist/index.html" ]; then
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo -e "${RED}[PROBLÈME] Script Lovable manquant dans le build.${NC}"
            echo -e "${YELLOW}[SOLUTION] Correction automatique disponible.${NC}"
            
            read -p "Appliquer la correction? [O/N]: " FIX_LOVABLE
            if [[ "$FIX_LOVABLE" =~ ^[Oo]$ ]]; then
                echo -e "${YELLOW}[INFO] Application de la correction...${NC}"
                sed -i.bak 's/<script /<script src="https:\/\/cdn.gpteng.co\/gptengineer.js" type="module"><\/script>\n    &/' dist/index.html
                echo -e "${GREEN}[OK] Script Lovable ajouté avec succès.${NC}"
            fi
        else
            echo -e "${GREEN}[OK] Script Lovable présent dans le build.${NC}"
        fi
    else
        echo -e "${YELLOW}[INFO] Dossier dist non trouvé, construction nécessaire.${NC}"
    fi

    # Problème de variable d'environnement
    if [ ! -f ".env.local" ]; then
        echo -e "${RED}[PROBLÈME] Fichier .env.local manquant.${NC}"
        echo -e "${YELLOW}[SOLUTION] Création d'un fichier .env.local par défaut.${NC}"
        
        read -p "Créer le fichier .env.local? [O/N]: " CREATE_ENV
        if [[ "$CREATE_ENV" =~ ^[Oo]$ ]]; then
            echo -e "${YELLOW}[INFO] Création du fichier .env.local...${NC}"
            cat > .env.local << EOF
VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
EOF
            echo -e "${GREEN}[OK] Fichier .env.local créé avec succès.${NC}"
        fi
    fi

    echo
    echo -e "${BLUE}==================================================="
    echo "           RAPPORT DE DIAGNOSTIC COMPLET"
    echo -e "===================================================${NC}"
    echo
    echo "Analyse du système:"
    echo -e "${YELLOW}[SYSTÈME] ${OS_INFO}${NC}"
    echo -e "${YELLOW}[CPU] ${CPU_INFO}${NC}"
    echo -e "${YELLOW}[RAM] ${MEMORY_GB} GB${NC}"
    echo -e "${YELLOW}[GPU] ${GPU_INFO}${NC}"
    echo
    echo "Configuration recommandée:"
    
    # Définition du mode recommandé
    if [ $MEMORY_GB -lt 8 ]; then
        echo -e "${RED}[ATTENTION] Mémoire insuffisante (${MEMORY_GB} GB).${NC}"
        echo "             Mode cloud recommandé."
        RECOMMENDED_MODE="cloud"
    elif [ $MEMORY_GB -ge 16 ]; then
        echo -e "${GREEN}[OK] Mémoire suffisante pour toutes les fonctionnalités.${NC}"
        RECOMMENDED_MODE="standard"
    else
        echo -e "${YELLOW}[OK] Mémoire acceptable mais limitée.${NC}"
        RECOMMENDED_MODE="standard"
    fi

    if [ $USE_GPU -eq 1 ]; then
        echo -e "${GREEN}[OK] GPU compatible pour l'accélération matérielle.${NC}"
        if [ "$RECOMMENDED_MODE" = "standard" ]; then RECOMMENDED_MODE="standard_gpu"; fi
    else
        echo -e "${YELLOW}[INFO] GPU sans accélération spécifique détectée.${NC}"
    fi

    if [ $OLLAMA_RUNNING -eq 1 ]; then
        echo -e "${GREEN}[OK] Ollama disponible pour l'IA locale.${NC}"
        if [ "$RECOMMENDED_MODE" = "standard_gpu" ]; then RECOMMENDED_MODE="standard_gpu_ollama"; fi
        if [ "$RECOMMENDED_MODE" = "standard" ]; then RECOMMENDED_MODE="standard_ollama"; fi
    else
        echo -e "${YELLOW}[INFO] Ollama non détecté, mode cloud sera utilisé pour l'IA.${NC}"
    fi

    echo
    echo "Mode recommandé: "
    if [ "$RECOMMENDED_MODE" = "cloud" ]; then
        echo -e "${YELLOW}[RECOMMANDATION] Mode cloud uniquement${NC}"
        echo "                   (Options limitées de matériel)"
    elif [ "$RECOMMENDED_MODE" = "standard_gpu_ollama" ]; then
        echo -e "${GREEN}[RECOMMANDATION] Mode standard avec GPU et Ollama${NC}"
        echo "                   (Configuration optimale)"
    elif [ "$RECOMMENDED_MODE" = "standard_ollama" ]; then
        echo -e "${GREEN}[RECOMMANDATION] Mode standard avec Ollama${NC}"
        echo "                   (Bonne configuration)"
    elif [ "$RECOMMENDED_MODE" = "standard_gpu" ]; then
        echo -e "${GREEN}[RECOMMANDATION] Mode standard avec GPU${NC}"
        echo "                   (Bonne configuration, sans IA locale)"
    else
        echo -e "${YELLOW}[RECOMMANDATION] Mode standard${NC}"
        echo "                   (Configuration de base)"
    fi

    echo
    echo "Que souhaitez-vous faire?"
    echo "[1] Démarrer avec le mode recommandé"
    echo "[2] Résoudre les problèmes détectés"
    echo "[3] Retourner au menu principal"
    echo
    read -p "Votre choix: " DIAG_ACTION

    if [ "$DIAG_ACTION" = "1" ]; then
        if [ "$RECOMMENDED_MODE" = "cloud" ]; then 
            clear
            START_CLOUD
        elif [ "$RECOMMENDED_MODE" = "standard_gpu_ollama" ]; then 
            clear
            START_STANDARD
        elif [ "$RECOMMENDED_MODE" = "standard_ollama" ]; then 
            clear
            START_STANDARD
        elif [ "$RECOMMENDED_MODE" = "standard_gpu" ]; then 
            clear
            START_STANDARD
        elif [ "$RECOMMENDED_MODE" = "standard" ]; then 
            clear
            START_STANDARD
        else
            clear
            START_STANDARD
        fi
    elif [ "$DIAG_ACTION" = "2" ]; then
        echo
        echo -e "${YELLOW}[INFO] Application des corrections automatiques...${NC}"
        
        # Correction du fichier .env.local
        if [ ! -f ".env.local" ]; then
            echo -e "${YELLOW}[INFO] Création du fichier .env.local...${NC}"
            cat > .env.local << EOF
VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
EOF
            echo -e "${GREEN}[OK] Fichier .env.local créé avec succès.${NC}"
        fi
        
        # Correction de noscript si nécessaire
        if [ -f "index.html" ]; then
            if grep -q "<noscript>" index.html && grep -q "<head>" index.html; then
                if grep -A5 "<noscript>" index.html | grep -q "<div"; then
                    echo -e "${YELLOW}[INFO] Correction de la balise noscript...${NC}"
                    sed -i.bak 's/\(<head>.*\)\(<noscript>.*<\/noscript>\)\(.*<\/head>\)/\1\3\n<body>\2/' index.html
                    echo -e "${GREEN}[OK] Balise noscript corrigée.${NC}"
                fi
            fi
        fi
        
        # Reconstruction si nécessaire
        if [ ! -d "dist" ]; then
            echo -e "${YELLOW}[INFO] Reconstruction de l'application...${NC}"
            export NODE_OPTIONS="--max-old-space-size=4096"
            npm run build
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ERREUR] Reconstruction échouée${NC}"
                echo -e "${YELLOW}[INFO] Tentative en mode de secours...${NC}"
                bash start-fallback-mode.sh
                read -p "Appuyez sur Entrée pour continuer..."
                clear
                MENU_PRINCIPAL
                return
            fi
            echo -e "${GREEN}[OK] Application reconstruite avec succès.${NC}"
        fi
        
        # Correction du script Lovable si nécessaire
        if [ -f "dist/index.html" ]; then
            if ! grep -q "gptengineer.js" "dist/index.html"; then
                echo -e "${YELLOW}[INFO] Ajout du script Lovable au build...${NC}"
                sed -i.bak 's/<script /<script src="https:\/\/cdn.gpteng.co\/gptengineer.js" type="module"><\/script>\n    &/' dist/index.html
                echo -e "${GREEN}[OK] Script Lovable ajouté avec succès.${NC}"
            fi
        fi
        
        echo
        echo -e "${GREEN}[OK] Corrections automatiques appliquées avec succès.${NC}"
        echo "     Vous pouvez maintenant démarrer l'application."
        read -p "Appuyez sur Entrée pour continuer..."
    fi
    
    clear
    MENU_PRINCIPAL
}

AIDE() {
    clear
    echo -e "${BLUE}==================================================="
    echo "           AIDE ET DOCUMENTATION"
    echo -e "===================================================${NC}"
    echo
    echo "Ce script offre plusieurs fonctionnalités pour vous aider"
    echo "à exécuter et dépanner FileChat en local:"
    echo
    echo "[1] Nettoyage et Configuration Complète"
    echo "   - Nettoie complètement l'environnement"
    echo "   - Réinstalle toutes les dépendances"
    echo "   - Reconstruit l'application"
    echo "   - Configure automatiquement selon votre matériel"
    echo
    echo "[2] Démarrage Rapide"
    echo "   - Lance l'application dans différents modes:"
    echo "     * Standard: utilise l'IA locale si disponible"
    echo "     * Cloud: utilise uniquement les services cloud"
    echo "     * Développeur: active les logs détaillés"
    echo
    echo "[3] Mode de Secours"
    echo "   - Désactive les fonctionnalités avancées"
    echo "   - Utilise une configuration minimale"
    echo "   - Assure un fonctionnement même en cas de problème"
    echo
    echo "[4] Diagnostics et Résolution Automatique"
    echo "   - Analyse votre système et l'application"
    echo "   - Détecte les problèmes courants"
    echo "   - Applique des corrections automatiques"
    echo
    echo "[5] Aide et Documentation"
    echo "   - Affiche cette aide"
    echo
    echo -e "${BLUE}==================================================${NC}"
    echo
    echo "Résolution des problèmes courants:"
    echo
    echo -e "${RED}[PROBLÈME] Page blanche après chargement${NC}"
    echo -e "${YELLOW}[SOLUTION] Utilisez l'option \"Mode de secours\" ou${NC}"
    echo "            \"Diagnostics et résolution automatique\""
    echo
    echo -e "${RED}[PROBLÈME] Erreur \"AI edits didn't result in any changes\"${NC}"
    echo -e "${YELLOW}[SOLUTION] Vérifiez que le script gptengineer.js est bien${NC}"
    echo "            inclus dans index.html. Le diagnostic peut"
    echo "            corriger ce problème automatiquement."
    echo
    echo -e "${RED}[PROBLÈME] Erreur avec noscript dans head${NC}"
    echo -e "${YELLOW}[SOLUTION] Le diagnostic détectera et corrigera${NC}"
    echo "            automatiquement ce problème."
    echo
    echo -e "${BLUE}==================================================${NC}"
    echo
    read -p "Appuyez sur Entrée pour retourner au menu principal..." -n1 -s
    clear
    MENU_PRINCIPAL
}

FIN() {
    clear
    echo -e "${BLUE}==================================================="
    echo "      MERCI D'AVOIR UTILISÉ L'ASSISTANT FILECHAT"
    echo -e "===================================================${NC}"
    echo
    echo "À bientôt!"
    echo
    sleep 3
    exit 0
}

# Rendre le script exécutable
chmod +x start-fallback-mode.sh 2>/dev/null

# Démarrer le menu principal
MENU_PRINCIPAL
