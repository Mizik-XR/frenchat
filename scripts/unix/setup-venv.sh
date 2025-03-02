
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
    
    # Vérifier si on est en mode sans Rust
    if [ "$NO_RUST_INSTALL" = "1" ]; then
        echo "Mode d'installation léger, sans dépendances nécessitant Rust..."
        pip install fastapi uvicorn pydantic
        pip install --only-binary=:all: tokenizers
        pip install transformers
        echo "Utilisation de modèles inférences via API - pas besoin de bitsandbytes"
    else
        # Vérifier si Rust/Cargo est installé
        if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
            echo "Rust n'est pas installé. Tentative d'installation automatique..."
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
            source "$HOME/.cargo/env"
            
            # Vérifier si l'installation a réussi
            if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
                echo "Installation de Rust échouée. Passage en mode léger..."
                export NO_RUST_INSTALL=1
                pip install fastapi uvicorn pydantic
                pip install --only-binary=:all: tokenizers
                pip install transformers
                echo "Utilisation de modèles inférences via API - pas besoin de bitsandbytes"
            else
                echo "Installation complète des dépendances avec Rust..."
                pip install -r requirements.txt
            fi
        else
            echo "Installation complète des dépendances avec Rust..."
            pip install -r requirements.txt
        fi
    fi
    
    if [ $? -ne 0 ]
    then
        echo "[ATTENTION] Installation des dépendances avec quelques erreurs"
        echo "            Certaines fonctionnalités avancées pourraient ne pas être disponibles."
    fi
    
    echo "[OK] Environnement Python configuré avec succès"
    echo ""
else
    # Activation de l'environnement virtuel existant
    source venv/bin/activate
fi
