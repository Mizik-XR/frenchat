
#!/bin/bash

# Vérification et création de l'environnement Python si nécessaire
echo "[INFO] Vérification de l'environnement Python..."
if [ ! -d "venv" ]
then
    echo "================================"
    echo "Configuration environnement Python"
    echo "================================"
    echo ""
    
    # Création de l'environnement virtuel
    python3 -m venv venv
    
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Création de l'environnement virtuel échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    # Activation de l'environnement virtuel
    source venv/bin/activate
    
    # Installation des dépendances
    pip install --upgrade pip
    
    # Installation de PyTorch avec l'URL correcte
    echo "Installation de PyTorch..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    
    # Installation des autres dépendances
    echo "Installation des autres dépendances..."
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    echo "[OK] Environnement Python configuré avec succès"
    echo ""
else
    # Activation de l'environnement virtuel existant
    source venv/bin/activate
fi
