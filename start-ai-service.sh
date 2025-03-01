
#!/bin/bash

echo "================================"
echo "Démarrage du service IA FileChat"
echo "================================"
echo ""

# Fonction d'installation de Python si nécessaire
install_python() {
    echo "[INFO] Python non détecté, tentative d'installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Veuillez installer Python depuis https://www.python.org/downloads/"
        echo "Ou utilisez Homebrew: brew install python3"
        return 1
    elif [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    elif [[ -f /etc/redhat-release ]]; then
        # RHEL/CentOS/Fedora
        sudo dnf install -y python3 python3-pip
    else
        echo "Distribution non reconnue. Veuillez installer Python manuellement."
        return 1
    fi
    return 0
}

# Vérification de Python
echo "[INFO] Vérification de Python..."
if ! command -v python3 &> /dev/null
then
    install_python
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Python 3 n'a pas pu être installé."
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
fi

echo "[OK] Python détecté: $(python3 --version)"
echo ""

# Vérification et création de l'environnement Python si nécessaire
echo "[INFO] Vérification de l'environnement Python..."
if [ ! -d "venv" ]
then
    echo "================================"
    echo "Configuration environnement Python"
    echo "================================"
    echo ""
    
    # Création de l'environnement virtuel
    python3 -m venv venv
    
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Création de l'environnement virtuel échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    # Activation de l'environnement virtuel
    source venv/bin/activate
    
    # Installation des dépendances
    pip install --upgrade pip
    pip install torch==2.0.1 --index-url https://download.pytorch.org/whl/cpu
    pip install transformers==4.36.2 accelerate==0.26.1 datasets==2.16.1 fastapi==0.109.0 uvicorn==0.27.0 pydantic==2.6.1
    
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    echo "[OK] Environnement Python configuré avec succès"
    echo ""
else
    # Activation de l'environnement virtuel existant
    source venv/bin/activate
fi

# Vérification du modèle IA
echo "[INFO] Vérification du serveur modèle IA..."
if [ ! -f "serve_model.py" ]
then
    echo "[ERREUR] Le fichier serve_model.py n'existe pas"
    echo ""
    echo "Appuyez sur une touche pour quitter..."
    read -n 1
    exit 1
fi

# Vérification des dépendances NPM
echo "[INFO] Vérification des dépendances NPM..."
if [ ! -d "node_modules" ]
then
    echo "[INFO] Installation des dépendances NPM..."
    npm install
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances NPM échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    echo "[OK] Dépendances NPM installées avec succès"
    echo ""
fi

# Configuration des origines autorisées pour CORS
export ALLOWED_ORIGINS="http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,*"
echo "[INFO] Origines CORS autorisées: $ALLOWED_ORIGINS"

# Démarrage du serveur IA
echo "================================"
echo "Démarrage du serveur IA local"
echo "================================"
echo ""

# Vérification si le port 8000 est déjà utilisé
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "[INFO] Le port 8000 est déjà utilisé, tentative d'arrêt du processus..."
    kill $(lsof -Pi :8000 -sTCP:LISTEN -t) 2>/dev/null
    sleep 2
fi

# Exécution du serveur en arrière-plan
python3 serve_model.py &
SERVER_PID=$!

# Vérification que le serveur a bien démarré
sleep 3
if ! ps -p $SERVER_PID > /dev/null; then
    echo "[ERREUR] Le serveur IA n'a pas pu démarrer"
    echo ""
    echo "Appuyez sur une touche pour quitter..."
    read -n 1
    exit 1
fi

echo "[OK] Serveur IA démarré avec succès (PID: $SERVER_PID)"
echo ""

# Vérification si le répertoire dist existe, sinon construire l'application
if [ ! -d "dist" ]; then
    echo "[INFO] Build de l'application web..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Build de l'application échoué"
        kill $SERVER_PID
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    echo "[OK] Application construite avec succès"
    echo ""
fi

# Démarrage d'un serveur HTTP simple
echo "[INFO] Démarrage du serveur web..."
if ! command -v npx &> /dev/null; then
    npm install -g http-server
    http-server dist -p 8080 &
else
    npx http-server dist -p 8080 &
fi
WEB_PID=$!

# Ouvrir le navigateur
echo "[INFO] Ouverture du navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080 &>/dev/null || sensible-browser http://localhost:8080 &>/dev/null || echo "[INFO] Veuillez ouvrir http://localhost:8080 dans votre navigateur"
fi

echo ""
echo "================================"
echo "FILECHAT DÉMARRÉ AVEC SUCCÈS"
echo "================================"
echo ""
echo "Services disponibles:"
echo "[1] Serveur IA local: http://localhost:8000"
echo "[2] Application Web: http://localhost:8080"
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
