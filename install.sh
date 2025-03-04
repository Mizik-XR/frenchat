
#!/bin/bash

echo "==================================================="
echo "           INSTALLATION UNIVERSELLE DE FRENCHAT"
echo "==================================================="
echo ""

# Détection du système d'exploitation
echo "[INFO] Détection du système d'exploitation..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "[OK] Système macOS détecté"
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "[OK] Système Linux détecté"
    OS_TYPE="linux"
else
    echo "[OK] Système Unix/BSD détecté"
    OS_TYPE="unix"
fi

# Rendre les scripts exécutables
echo "[INFO] Configuration des permissions des scripts..."
chmod +x scripts/unix/*.sh
chmod +x start-universal.sh
chmod +x start-ai-service.sh

# Vérification de Python
echo "[INFO] Vérification de Python..."
if ! command -v python3 &> /dev/null; then
    echo "[ERREUR] Python 3 n'est pas installé."
    echo "Veuillez installer Python 3 depuis https://www.python.org/downloads/"
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Python est installé: $(python3 --version)"
echo ""

# Vérification de Node.js
echo "[INFO] Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé."
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Node.js est installé: $(node --version)"
echo ""

# Vérification de npm
echo "[INFO] Vérification de npm..."
if ! command -v npm &> /dev/null; then
    echo "[ERREUR] npm n'est pas installé."
    echo "Veuillez réinstaller Node.js depuis https://nodejs.org/"
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] npm est installé: $(npm --version)"
echo ""

# Installation des dépendances
echo "[INFO] Installation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERREUR] L'installation des dépendances a échoué."
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Dépendances npm installées."
echo ""

# Configuration de l'environnement Python
echo "[INFO] Configuration de l'environnement Python..."
source scripts/unix/setup-venv.sh
if [ $? -ne 0 ]; then
    echo "[ERREUR] La configuration de l'environnement Python a échoué."
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Environnement Python configuré."
echo ""

# Construction de l'application
echo "[INFO] Construction de l'application..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build
if [ $? -ne 0 ]; then
    echo "[ATTENTION] La construction avec npm run build a échoué, tentative avec npx..."
    NODE_OPTIONS="--max-old-space-size=4096" npx vite build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] La construction de l'application a échoué."
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read -n1 -s
        exit 1
    fi
fi
echo "[OK] Application construite avec succès."
echo ""

# Création d'un raccourci ou lien symbolique si possible
echo "[INFO] Création de raccourcis..."
if [[ "$OS_TYPE" == "macos" ]]; then
    # Sur macOS, créer un fichier .command qui peut être double-cliqué
    echo "#!/bin/bash" > ~/Desktop/Frenchat.command
    echo "cd \"$(pwd)\"" >> ~/Desktop/Frenchat.command
    echo "./start-universal.sh" >> ~/Desktop/Frenchat.command
    chmod +x ~/Desktop/Frenchat.command
    echo "[OK] Raccourci créé sur le Bureau (Frenchat.command)"
elif [[ "$OS_TYPE" == "linux" ]]; then
    # Sur Linux, créer un fichier .desktop
    mkdir -p ~/.local/share/applications
    cat > ~/.local/share/applications/frenchat.desktop << EOF
[Desktop Entry]
Name=Frenchat
Comment=Assistant IA Conversationnel
Exec=bash -c "cd $(pwd) && ./start-universal.sh"
Icon=$(pwd)/public/favicon.ico
Terminal=true
Type=Application
Categories=Utility;
EOF
    echo "[OK] Raccourci créé dans le menu des applications"
fi

echo "==================================================="
echo "          INSTALLATION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo ""
echo "Frenchat a été installé et configuré avec succès !"
echo ""
echo "Pour démarrer Frenchat, vous pouvez :"
echo "- Exécuter ./start-universal.sh dans ce dossier"
if [[ "$OS_TYPE" == "macos" ]]; then
    echo "- Double-cliquer sur le raccourci Frenchat.command sur votre Bureau"
elif [[ "$OS_TYPE" == "linux" ]]; then
    echo "- Lancer Frenchat depuis le menu des applications"
fi
echo ""
echo "Appuyez sur Entrée pour démarrer Frenchat maintenant..."
read -n1 -s

# Lancement de Frenchat
./start-universal.sh
exit 0
