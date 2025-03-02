
#!/bin/bash

echo "==================================================="
echo "            DÉMARRAGE DE FILECHAT"
echo "==================================================="
echo ""
echo "[INFO] Note: Les fonctionnalités Microsoft Teams sont"
echo "[INFO] temporairement désactivées dans cette version de test"
echo "[INFO] pour respecter les limites du plan Supabase."

# Activer le mode cloud par défaut - moins invasif
export MODE_CLOUD=1

# Option pour forcer la reconstruction
FORCE_REBUILD=0
if [ "$1" == "--rebuild" ]; then
    FORCE_REBUILD=1
    echo "[INFO] Option de reconstruction forcée activée"
fi

# Vérification du dossier dist
if [ ! -d "dist" ] || [ "$FORCE_REBUILD" == "1" ]; then
    echo "[INFO] Construction de l'application en cours..."
    rm -rf dist 2>/dev/null
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

# Vérification du fichier index.html dans dist
if [ ! -f "dist/index.html" ]; then
    echo "[ERREUR] Le fichier 'dist/index.html' est manquant."
    echo "[INFO] Reconstruction de l'application en cours..."
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

# Vérification du contenu du fichier index.html
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Le script Lovable manque dans index.html, reconstruction..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Construction de l'application échouée"
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
    echo "[OK] Application reconstruite avec succès."
    echo ""
fi

# Vérifier si http-server est installé
if ! command -v http-server &> /dev/null; then
    echo "[INFO] Installation de http-server..."
    npm install -g http-server &> /dev/null
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation de http-server échouée."
        echo "         Veuillez contacter le support technique."
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    fi
fi

# Animation de chargement
echo "Initialisation de FileChat en cours..."
for ((i=1; i<=20; i++)); do
    echo -n "█"
    sleep 0.05
done
echo " OK!"
echo ""

# Vérification rapide si Ollama est disponible
echo "[INFO] Recherche d'Ollama sur votre système..."
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[OK] Ollama détecté! Le mode IA local sera disponible automatiquement."
else
    echo "[INFO] Ollama n'est pas actif. Mode cloud activé par défaut."
fi
echo ""

# Démarrage de l'application web
echo "[INFO] Démarrage de l'interface web..."
http-server dist -p 8080 -c-1 --cors &> /dev/null &
SERVER_PID=$!
sleep 2

# Ouvrir le navigateur
echo "[INFO] Ouverture de FileChat dans votre navigateur..."
if [ "$(uname)" == "Darwin" ]; then
    # MacOS
    open http://localhost:8080
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    xdg-open http://localhost:8080 &> /dev/null || sensible-browser http://localhost:8080 &> /dev/null || echo "Veuillez ouvrir manuellement: http://localhost:8080"
fi
echo ""

echo "==================================================="
echo "      FILECHAT EST PRÊT À ÊTRE UTILISÉ"
echo "==================================================="
echo ""
echo "FileChat s'exécute maintenant dans votre navigateur."
echo ""
echo "Si vous souhaitez:"
echo " - Utiliser l'IA locale: Configurez-la dans les paramètres de l'application"
echo " - Utiliser l'IA cloud: Aucune configuration supplémentaire n'est nécessaire"
echo ""
echo "Cette fenêtre peut être minimisée. Ne la fermez pas tant que"
echo "vous utilisez FileChat."
echo ""
echo "Pour forcer une reconstruction, utilisez: ./start-app-simplified.sh --rebuild"
echo ""
echo "==================================================="

# Attendre que l'utilisateur interrompe le script
echo "Appuyez sur Ctrl+C pour arrêter FileChat..."
trap "kill $SERVER_PID; echo ''; echo 'Fermeture de FileChat...'; exit 0" INT
wait
