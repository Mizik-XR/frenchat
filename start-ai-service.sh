
#!/bin/bash

echo "================================"
echo "Démarrage du service IA FileChat"
echo "================================"
echo ""

# Vérification de Python
echo "[INFO] Vérification de Python..."
if ! command -v python3 &> /dev/null
then
    echo "[ERREUR] Python 3 n'est pas installé. Veuillez l'installer."
    echo ""
    echo "Appuyez sur une touche pour quitter..."
    read -n 1
    exit 1
fi

echo "[OK] Python détecté: $(python3 --version)"
echo ""

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
    pip install torch transformers fastapi uvicorn pydantic
    
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

# Vérification du modèle IA
echo "[INFO] Vérification du serveur modèle IA..."
if [ ! -f "serve_model.py" ]
then
    echo "[ERREUR] Le fichier serve_model.py n'existe pas"
    echo ""
    echo "Appuyez sur une touche pour quitter..."
    read -n 1
    exit 1
fi

# Configuration des origines autorisées pour CORS
export ALLOWED_ORIGINS="http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,*"
echo "[INFO] Origines CORS autorisées: $ALLOWED_ORIGINS"

# Démarrage du serveur IA
echo "================================"
echo "Démarrage du serveur IA local"
echo "================================"
echo ""

# Exécution du serveur
python3 serve_model.py

# On ne devrait jamais atteindre cette partie sauf en cas d'erreur
echo "[ERREUR] Le serveur s'est arrêté de manière inattendue"
echo ""
echo "Appuyez sur une touche pour quitter..."
read -n 1
exit 1
