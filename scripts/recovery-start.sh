
#!/bin/bash

clear
echo "==================================================="
echo "     FILECHAT - MODE RÉCUPÉRATION"
echo "==================================================="
echo
echo "Ce script démarre FileChat avec des optimisations"
echo "pour résoudre les problèmes d'initialisation React."
echo

# Nettoyage des caches
echo "[1/5] Nettoyage des caches..."
rm -rf node_modules/.vite

# Configuration des variables d'environnement
echo "[2/5] Configuration des variables..."
export VITE_FORCE_OPTIMIZE=true
export VITE_DISABLE_OPTIMIZEDEPS=false
export VITE_DEBUG_REACT=true
export VITE_FORCE_VENDOR_CHUNK=true

# Construction optimisée
echo "[3/5] Construction optimisée..."
npm run build -- --force --debug-react

if [ $? -ne 0 ]; then
    echo
    echo "[ERREUR] La construction a échoué. Tentative en mode minimal..."
    echo
    npx vite build --config scripts/minimal-vite.config.js
    
    if [ $? -ne 0 ]; then
        echo
        echo "[ERREUR CRITIQUE] La construction minimale a également échoué."
        echo "Consultez les messages d'erreur ci-dessus."
        echo
        read -p "Appuyez sur Entrée pour quitter..."
        exit 1
    fi
fi

# Démarrage du serveur
echo "[4/5] Démarrage du serveur web..."
npx serve dist -p 8080 --no-clipboard &
SERVER_PID=$!

# Ouverture du navigateur
echo "[5/5] Ouverture dans le navigateur..."
sleep 2

# Ouvrir le navigateur selon la plateforme
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8080/?recovery=true&forceCloud=true"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:8080/?recovery=true&forceCloud=true" &>/dev/null || 
    sensible-browser "http://localhost:8080/?recovery=true&forceCloud=true" &>/dev/null || 
    echo "Veuillez ouvrir http://localhost:8080/?recovery=true&forceCloud=true dans votre navigateur"
fi

echo
echo "==================================================="
echo "     FILECHAT DÉMARRÉ EN MODE RÉCUPÉRATION"
echo "==================================================="
echo
echo "L'application est maintenant accessible à l'adresse:"
echo "http://localhost:8080/?recovery=true&forceCloud=true"
echo
echo "Si vous rencontrez toujours des problèmes:"
echo "1. Exécutez \"node scripts/detect-dependency-cycles.js\""
echo "2. Vérifiez si des dépendances circulaires sont détectées"
echo "3. Consultez les erreurs dans la console du navigateur"
echo
echo "Pour quitter, appuyez sur Ctrl+C"
echo "==================================================="

wait $SERVER_PID
