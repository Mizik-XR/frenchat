
#!/bin/bash

echo "==================================================="
echo "            DÉMARRAGE DE FILECHAT"
echo "==================================================="
echo ""

# Activer le mode cloud par défaut - moins invasif
export MODE_CLOUD=1

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
http-server dist -p 8080 &> /dev/null &
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
echo "==================================================="

# Attendre que l'utilisateur interrompe le script
echo "Appuyez sur Ctrl+C pour arrêter FileChat..."
trap "kill $SERVER_PID; echo ''; echo 'Fermeture de FileChat...'; exit 0" INT
wait
