
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
    pip install torch==2.0.1 --index-url https://download.pytorch.org/whl/cpu
    pip install transformers==4.36.2 accelerate==0.26.1 datasets==2.16.1 fastapi==0.109.0 uvicorn==0.27.0 pydantic==2.6.1
    
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
