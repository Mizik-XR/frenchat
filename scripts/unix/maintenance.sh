
#!/bin/bash

clear
echo "==================================================="
echo "     MAINTENANCE DE FILECHAT"
echo "==================================================="
echo ""
echo "[1] Nettoyage de cache"
echo "[2] Reconstruction de l'application"
echo "[3] Vérification de l'environnement"
echo "[4] Réparation des problèmes courants"
echo "[5] Quitter"
echo ""
read -p "Votre choix [1-5]: " CHOICE

case $CHOICE in
    1)
        clear
        echo "==================================================="
        echo "     NETTOYAGE DE CACHE"
        echo "==================================================="
        echo ""
        echo "[INFO] Suppression des caches..."
        if [ -d ".vite" ]; then
            rm -rf .vite
            echo "[OK] Cache Vite supprimé."
        fi
        if [ -d "node_modules/.vite" ]; then
            rm -rf node_modules/.vite
            echo "[OK] Cache Vite dans node_modules supprimé."
        fi
        npm cache clean --force
        echo "[OK] Cache NPM nettoyé."
        echo ""
        read -p "Appuyez sur Entrée pour continuer..." -n1 -s
        ;;
    2)
        clear
        echo "==================================================="
        echo "     RECONSTRUCTION DE L'APPLICATION"
        echo "==================================================="
        echo ""
        echo "[INFO] Construction de l'application..."
        export NODE_OPTIONS="--max-old-space-size=4096"
        npm run build
        if [ $? -ne 0 ]; then
            echo "[ERREUR] Échec de la construction."
            read -p "Appuyez sur Entrée pour continuer..." -n1 -s
            exit 1
        fi
        echo "[OK] Application reconstruite avec succès."
        echo ""
        read -p "Appuyez sur Entrée pour continuer..." -n1 -s
        ;;
    3)
        clear
        echo "==================================================="
        echo "     VÉRIFICATION DE L'ENVIRONNEMENT"
        echo "==================================================="
        echo ""
        echo "[INFO] Vérification de Node.js..."
        node -v
        echo "[INFO] Vérification de NPM..."
        npm -v
        echo "[INFO] Vérification de Python..."
        python --version 2>/dev/null || python3 --version
        echo ""
        if [ -f ".env.local" ]; then
            echo "[INFO] Fichier .env.local détecté."
        else
            echo "[INFO] Création du fichier .env.local..."
            cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
VITE_LOVABLE_VERSION=dev
FORCE_CLOUD_MODE=true
EOF
            echo "[OK] Fichier .env.local créé."
        fi
        echo ""
        read -p "Appuyez sur Entrée pour continuer..." -n1 -s
        ;;
    4)
        clear
        echo "==================================================="
        echo "     RÉPARATION DES PROBLÈMES COURANTS"
        echo "==================================================="
        echo ""
        echo "[INFO] Vérification des dépendances..."
        npm install
        echo "[INFO] Configuration du mode cloud..."
        echo "FORCE_CLOUD_MODE=true" > .env.local
        echo "VITE_DISABLE_DEV_MODE=true" >> .env.local
        echo "[INFO] Reconstruction de l'application..."
        export NODE_OPTIONS="--max-old-space-size=4096"
        npm run build
        echo ""
        echo "[INFO] Vérification du script Lovable..."
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "[INFO] Ajout du script Lovable..."
            sed -i.bak '/<script type="module" crossorigin/i \    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' dist/index.html
            rm -f dist/index.html.bak
            echo "[OK] Script Lovable ajouté."
        else
            echo "[OK] Script Lovable déjà présent."
        fi
        echo ""
        echo "[OK] Réparation terminée."
        read -p "Appuyez sur Entrée pour continuer..." -n1 -s
        ;;
    5)
        exit 0
        ;;
    *)
        echo ""
        echo "Choix invalide. Veuillez réessayer."
        sleep 2
        source $0
        ;;
esac

exit 0
