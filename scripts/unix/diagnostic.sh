
#!/bin/bash

echo "================================"
echo "Diagnostic de l'environnement FileChat"
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

echo "[1] Vérification de Python..."
if command -v python3 &> /dev/null; then
    python3 --version
    echo "[OK] Python est correctement installé."
else
    echo "[ATTENTION] Python n'est pas installé ou n'est pas dans votre PATH."
    echo "            Cela ne pose pas de problème en mode cloud uniquement."
fi
echo 

echo "[2] Vérification de Ollama..."
if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[OK] Ollama est actif et fonctionne sur votre système."
    echo "     C'est la solution recommandée pour l'IA locale."
else
    if command -v ollama &> /dev/null; then
        echo "[INFO] Ollama est installé mais n'est pas actif."
        echo "       Vous pouvez démarrer Ollama pour utiliser l'IA locale."
    else
        echo "[INFO] Ollama n'est pas installé."
        echo "       Téléchargement recommandé: https://ollama.ai/download"
    fi
fi
echo 

echo "[3] Vérification de Rust..."
if command -v rustc >/dev/null 2>&1; then
    echo "[OK] Rust est correctement installé:"
    rustc --version
    cargo --version
else
    echo "[INFO] Rust n'est pas installé."
    echo "       Ce n'est pas un problème si vous utilisez Ollama ou le mode cloud."
fi
echo 

echo "[4] Vérification de l'environnement virtuel..."
if [ -d "venv" ]; then
    echo "[OK] Environnement virtuel trouvé."
    source venv/bin/activate
    
    echo "[5] Versions des packages installés:"
    pip list | grep -E "torch|transformers|tokenizers|fastapi" || echo "     Aucun package IA trouvé (mode cloud uniquement)"
    echo 
    
    echo "[6] Test d'importation Python..."
    python3 -c "try: import transformers; import tokenizers; import fastapi; print('[OK] Import réussi!'); except ImportError as e: print('[INFO] Certains packages ne sont pas installés:',e)" 2>/dev/null
else
    echo "[INFO] Environnement virtuel non trouvé."
    echo "       Ce n'est pas un problème si vous utilisez le mode cloud uniquement."
fi

echo
echo "================================"
echo "Recommandations"
echo "================================"
echo
echo "Votre système est configuré pour:"
if [ -d "venv" ]; then
    echo "[V] Mode IA locale (Python)"
else
    echo "[ ] Mode IA locale (Python) - Non configuré"
fi

if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[V] Mode IA locale (Ollama) - Recommandé"
else
    echo "[ ] Mode IA locale (Ollama) - Non configuré/actif"
fi

echo "[V] Mode Cloud (Toujours disponible)"
echo
echo "Solution recommandée:"
echo "-------------------"
echo "1. Utiliser Ollama pour l'IA locale (simple et efficace)"
echo "2. Utiliser le mode cloud si l'IA locale n'est pas nécessaire"
echo
echo "================================"
echo "Fin du diagnostic"
echo "================================"
echo
echo "Pour obtenir de l'aide supplémentaire, contactez le support technique."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
