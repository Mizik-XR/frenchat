
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

# Vérification des dépendances Babel
echo "[INFO] Vérification des dépendances Babel..."
if [ ! -d "node_modules/@babel" ]
then
    echo "[INFO] Installation des dépendances Babel..."
    npm install --legacy-peer-deps @babel/core@latest @babel/preset-env@latest @babel/preset-react@latest @babel/plugin-transform-react-jsx@latest
    if [ $? -ne 0 ]
    then
        echo "[ERREUR] Installation des dépendances Babel échouée"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    echo "[OK] Dépendances Babel installées avec succès"
    echo ""
fi
