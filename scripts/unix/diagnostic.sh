
#!/bin/bash

echo "================================"
echo "Diagnostic de l'environnement FileChat"
echo "================================"
echo 

echo "[1] Vérification de Python..."
python3 --version
echo 

echo "[2] Vérification de Rust..."
rustc --version
cargo --version
echo 

echo "[3] Vérification de l'environnement virtuel..."
if [ -d "venv" ]; then
    echo "Environnement virtuel trouvé."
    source venv/bin/activate
    echo 
    
    echo "[4] Versions des packages installés:"
    pip list | grep -E "torch|transformers|tokenizers"
    echo 
    
    echo "[5] Test d'importation Python..."
    python -c "import torch; import transformers; import tokenizers; print('Import réussi!')"
else
    echo "Environnement virtuel non trouvé."
fi

echo 
echo "================================"
echo "Fin du diagnostic"
echo "================================"
echo 
read -p "Appuyez sur une touche pour continuer..." -n1 -s
