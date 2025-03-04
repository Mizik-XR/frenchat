
#!/bin/bash

echo "================================"
echo "   DIAGNOSTIC COMPLET DE FILECHAT"
echo "================================"
echo 

# Animation pour simuler le traitement
echo "Analyse de votre système en cours..."
for ((i=1; i<=20; i++)); do
    echo -n "█"
    sleep 0.05
done
echo " OK!"
echo

echo "[1] Vérification de l'environnement JavaScript..."
if command -v node &> /dev/null; then
    node --version
    echo "[OK] Node.js est correctement installé."
else
    echo "[ERREUR] Node.js n'est pas installé."
    echo "         Téléchargez-le depuis https://nodejs.org/"
fi
echo 

echo "[2] Vérification de Python..."
PYTHON_STATUS=0
if command -v python3 &> /dev/null; then
    python3 --version
    echo "[OK] Python3 est correctement installé."
    PYTHON_STATUS=1
elif command -v python &> /dev/null; then
    python --version
    echo "[OK] Python est correctement installé."
    PYTHON_STATUS=1
else
    echo "[INFO] Python n'est pas installé ou n'est pas dans le PATH."
    echo "       Le mode cloud reste disponible."
    echo "       Pour utiliser l'IA en local, installez Python depuis https://www.python.org/downloads/"
fi
echo 

echo "[3] Vérification d'Ollama..."
OLLAMA_RUNNING=0
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[OK] Ollama est en cours d'exécution sur le port 11434."
    OLLAMA_RUNNING=1
else
    if command -v ollama &> /dev/null; then
        echo "[INFO] Ollama est installé mais n'est pas en cours d'exécution."
        echo "       Démarrez Ollama pour utiliser l'IA locale."
    else
        echo "[INFO] Ollama n'est pas détecté sur ce système."
        echo "       Téléchargez-le depuis https://ollama.ai/download"
    fi
fi
echo 

echo "[4] Vérification des dépendances npm..."
if [ -d "node_modules" ]; then
    echo "[OK] Dépendances npm installées."
else
    echo "[INFO] Les dépendances npm ne sont pas installées."
    echo "       Exécutez 'npm install' pour les installer."
fi
echo 

echo "[5] Vérification de la build..."
if [ -f "dist/index.html" ]; then
    echo "[OK] Build existante détectée."
else
    echo "[INFO] Aucune build détectée."
    echo "       Exécutez 'npm run build' pour créer une build."
fi
echo 

echo "[6] Test de connectivité réseau..."
if ping -c 1 api.openai.com >/dev/null 2>&1; then
    echo "[OK] Connexion à Internet fonctionnelle."
else
    echo "[ATTENTION] Problème de connexion Internet détecté."
    echo "            Vérifiez votre connexion réseau."
fi
echo 

echo "================================"
echo "   RÉSULTATS ET RECOMMANDATIONS"
echo "================================"
echo
echo "Modes disponibles:"
echo
echo "[✓] Mode cloud (toujours disponible)"

if [ "$OLLAMA_RUNNING" -eq 1 ]; then
    echo "[✓] Mode IA locale via Ollama (détecté et actif)"
else
    echo "[ ] Mode IA locale via Ollama (non disponible)"
fi

if [ "$PYTHON_STATUS" -eq 1 ]; then
    if python3 -c "import transformers" >/dev/null 2>&1 || python -c "import transformers" >/dev/null 2>&1; then
        echo "[✓] Mode IA locale via Python et Hugging Face (disponible)"
    else
        echo "[ ] Mode IA locale via Python et Hugging Face (non disponible)"
    fi
else
    echo "[ ] Mode IA locale via Python et Hugging Face (non disponible)"
fi
echo

echo "Recommandation:"
if [ "$OLLAMA_RUNNING" -eq 1 ]; then
    echo "- Utilisez './start-universal.sh' pour démarrer avec Ollama (mode hybride)"
else
    echo "- Utilisez './start-app-simplified.sh' pour le mode cloud uniquement"
fi
echo

echo "================================"
echo
echo "Appuyez sur Entrée pour quitter..."
read
