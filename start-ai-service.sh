
#!/bin/bash

echo "================================"
echo "Démarrage du service IA FileChat"
echo "================================"
echo ""

export NO_RUST_INSTALL=1

# Rendre les scripts exécutables
chmod +x scripts/unix/check-dependencies.sh
chmod +x scripts/unix/setup-venv.sh
chmod +x scripts/unix/check-npm.sh
chmod +x scripts/unix/check-build.sh
chmod +x scripts/unix/start-servers.sh
chmod +x scripts/unix/diagnostic.sh

# Vérification des dépendances
source scripts/unix/check-dependencies.sh
if [ $? -ne 0 ]; then exit 1; fi

# Mode d'installation
echo "================================"
echo "Mode d'installation"
echo "================================"
echo "1. Mode léger (recommandé) - sans compilation de dépendances"
echo "2. Mode complet - avec compilation (nécessite Rust)"
echo ""
read -p "Choisissez le mode d'installation [1/2] (1 par défaut): " INSTALL_MODE

if [ "$INSTALL_MODE" = "2" ]; then
    echo "[INFO] Mode complet sélectionné"
    export NO_RUST_INSTALL=0
else
    echo "[INFO] Mode léger sélectionné (sans Rust)"
    export NO_RUST_INSTALL=1
fi

# Configuration de l'environnement Python
source scripts/unix/setup-venv.sh
if [ $? -ne 0 ]; then exit 1; fi

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
source scripts/unix/check-npm.sh
if [ $? -ne 0 ]; then exit 1; fi

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

# Vérification du build et lancement des serveurs
source scripts/unix/check-build.sh
if [ $? -ne 0 ]; then 
    kill $SERVER_PID
    exit 1
fi

# Démarrage des serveurs web et gestion des connexions
source scripts/unix/start-servers.sh $SERVER_PID
