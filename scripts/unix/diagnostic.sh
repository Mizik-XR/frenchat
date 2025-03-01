
#!/bin/bash

echo "================================"
echo "Diagnostic de l'environnement FileChat"
echo "================================"
echo 

echo "[1] Vérification de Python..."
python3 --version
echo 

echo "[2] Vérification de Rust..."
if command -v rustc >/dev/null 2>&1; then
    echo "Rust est installé:"
    rustc --version
    cargo --version
else
    echo "Rust n'est pas installé. Mode léger activé."
fi
echo 

echo "[3] Vérification de l'environnement virtuel..."
if [ -d "venv" ]; then
    echo "Environnement virtuel trouvé."
    source venv/bin/activate
    echo 
    
    echo "[4] Versions des packages installés:"
    pip list | grep -E "torch|transformers|tokenizers|fastapi"
    echo 
    
    echo "[5] Test d'importation Python..."
    python -c "import transformers; import tokenizers; import fastapi; print('Import réussi!')" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Certains packages ne sont pas correctement installés."
        echo "Exécutez 'scripts/unix/setup-venv.sh' pour réinstaller les dépendances."
    fi
else
    echo "Environnement virtuel non trouvé."
    echo "Exécutez 'scripts/unix/setup-venv.sh' pour créer l'environnement."
fi

echo 
echo "================================"
echo "Fin du diagnostic"
echo "================================"
echo 
read -p "Appuyez sur une touche pour continuer..." -n1 -s
