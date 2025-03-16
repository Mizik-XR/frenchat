
#!/bin/bash

echo "====================================================="
echo "     DÉMARRAGE D'URGENCE DE FILECHAT"
echo "====================================================="
echo ""
echo "Ce script va démarrer FileChat en mode ultra-minimal"
echo "pour contourner les problèmes d'initialisation React."
echo ""

# Nettoyer le cache et forcer le mode cloud
echo "[ACTION] Nettoyage du cache local..."
rm -f dist/*.map 2>/dev/null
echo "[ACTION] Forçage du mode cloud..."
echo "true" > FORCE_CLOUD_MODE

# Vérifier dist ou le créer ultra-minimal si nécessaire
if [ ! -d "dist" ]; then
    echo "[ACTION] Création d'un fichier d'urgence minimal..."
    mkdir -p dist 2>/dev/null
    
    cat > dist/index.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>FileChat - Mode d'urgence</title>
  <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#f0f7ff}</style>
</head>
<body>
  <h1>FileChat - Mode d'urgence</h1>
  <p>Redirection vers la version cloud...</p>
  <script>window.location.href='https://filechat.vercel.app/?forceCloud=true'</script>
</body>
</html>
EOF
else
    echo "[ACTION] Le dossier dist existe déjà."
fi

# Démarrer un serveur HTTP ultra-simple
echo "[ACTION] Démarrage du serveur d'urgence..."
npx serve dist -p 8888 --no-clipboard &
SERVER_PID=$!
sleep 2

# Ouvrir le navigateur selon la plateforme
echo "[ACTION] Ouverture du navigateur..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8888/?emergency=true&forceCloud=true"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:8888/?emergency=true&forceCloud=true" &>/dev/null || 
    sensible-browser "http://localhost:8888/?emergency=true&forceCloud=true" &>/dev/null || 
    echo "[INFO] Veuillez ouvrir http://localhost:8888/?emergency=true&forceCloud=true dans votre navigateur"
fi

echo ""
echo "====================================================="
echo "     FILECHAT DÉMARRÉ EN MODE D'URGENCE"
echo "====================================================="
echo ""
echo "L'application est maintenant accessible à l'adresse:"
echo "http://localhost:8888/?emergency=true&forceCloud=true"
echo ""
echo "Cette version contourne les problèmes d'initialisation React."
echo ""
echo "Appuyez sur Ctrl+C pour quitter."

# Attendre que l'utilisateur arrête le script avec Ctrl+C
wait $SERVER_PID
