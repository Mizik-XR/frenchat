
#!/bin/bash

# Vérification des dépendances NPM
echo "[INFO] Vérification des dépendances NPM..."
if [ ! -d "node_modules" ]
then
    echo "[INFO] Installation des dépendances NPM..."
    
    # Vérifier si npm est disponible
    if ! command -v npm &> /dev/null
    then
        echo "[ERREUR] npm n'est pas installé ou n'est pas dans le PATH"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    # Vérifier les vulnérabilités avant l'installation
    echo "[INFO] Vérification des vulnérabilités..."
    npm audit --production
    
    # Installation avec limitation des privilèges scripts
    npm install --no-fund --audit=true --ignore-scripts=false
    
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances NPM échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    
    echo "[OK] Dépendances NPM installées avec succès"
    
    # Vérifier à nouveau les vulnérabilités après l'installation
    echo "[INFO] Vérification finale des vulnérabilités..."
    npm audit --production
    echo ""
fi
