
#!/bin/bash

# Vérification si le répertoire dist existe, sinon construire l'application
if [ ! -d "dist" ]; then
    echo "[INFO] Build de l'application web..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Build de l'application échoué"
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
    echo "[OK] Application construite avec succès"
    echo ""
fi
