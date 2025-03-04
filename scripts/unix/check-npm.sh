
#!/bin/bash

# Vérification des dépendances NPM
echo "[INFO] Vérification des dépendances NPM..."
if [ ! -d "node_modules" ]
then
    echo "[INFO] Installation des dépendances NPM..."
    npm install
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances NPM échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    echo "[OK] Dépendances NPM installées avec succès"
    echo ""
fi
