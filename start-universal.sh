
#!/bin/bash

echo "==================================================="
echo "            DÉMARRAGE UNIVERSEL DE FILECHAT"
echo "==================================================="
echo ""

# Vérification de la présence du script Lovable
echo "[INFO] Vérification de la configuration Lovable..."
if [ -f "index.html" ]; then
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Script Lovable manquant, correction en cours..."
        if [ -f "scripts/unix/fix-edit-issues.sh" ]; then
            bash scripts/unix/fix-edit-issues.sh
        else
            echo "[INFO] Création du correctif..."
            mkdir -p scripts/unix
            cat > scripts/unix/fix-edit-issues.sh << 'EOF'
#!/bin/bash
sed -i 's|</body>|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>\n</body>|g' index.html
echo "Correction appliquée à index.html"
EOF
            chmod +x scripts/unix/fix-edit-issues.sh
            bash scripts/unix/fix-edit-issues.sh
        fi
    else
        echo "[OK] Configuration Lovable correcte."
    fi
else
    echo "[ATTENTION] index.html introuvable, création d'un fichier minimal..."
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frenchat - Votre assistant d'intelligence documentaire</title>
    <meta name="description" content="Frenchat indexe automatiquement tous vos documents." />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  </head>
  <body>
    <div id="root"></div>
    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
EOF
    echo "[OK] Fichier index.html créé."
fi

# Vérification de la compatibilité React
echo "[INFO] Vérification de la compatibilité React..."
if [ -f "node_modules/react/package.json" ]; then
    if ! grep -q "\"version\": \"18" "node_modules/react/package.json"; then
        echo "[ATTENTION] Version de React incompatible détectée, correction en cours..."
        npm uninstall react react-dom
        npm cache clean --force
        npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
        echo "[OK] React réinstallé avec la version compatible."
    else
        echo "[OK] Version de React compatible."
    fi
else
    echo "[ATTENTION] Installation React manquante ou incomplète."
    echo "[INFO] Installation des dépendances React..."
    npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
fi

# Vérification du fichier _redirects
echo "[INFO] Vérification du fichier _redirects..."
if [ ! -f "public/_redirects" ]; then
    echo "[INFO] Création du fichier _redirects..."
    mkdir -p public
    echo "/* /index.html 200" > "public/_redirects"
    echo "[OK] Fichier _redirects créé."
fi

# Reconstruction forcée pour s'assurer que tout est à jour
echo "[INFO] Reconstruction du projet pour appliquer les modifications..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ATTENTION] La reconstruction a échoué, tentative avec des options simplifiées..."
    export NO_RUST_INSTALL=1
    export NODE_OPTIONS=--max-old-space-size=4096
    npm run build --force
fi

# Choix du mode de démarrage
echo ""
echo "Choisissez le mode de démarrage :"
echo "1. Mode développement (npm run dev)"
echo "2. Mode production locale (bash scripts/unix/start-app-simplified.sh)"
echo "3. Mode cloud uniquement (MODE_CLOUD=1)"
echo ""
read -p "Votre choix [1-3] (1 par défaut): " choice

case $choice in
    2)
        echo "[INFO] Démarrage en mode production locale..."
        if [ -f "scripts/unix/start-app-simplified.sh" ]; then
            bash scripts/unix/start-app-simplified.sh
        else
            echo "[INFO] Démarrage du serveur web simple..."
            npx http-server dist -p 8080 -c-1 --cors
        fi
        ;;
    3)
        echo "[INFO] Démarrage en mode cloud uniquement..."
        export MODE_CLOUD=1
        if [ -f "scripts/unix/start-app-simplified.sh" ]; then
            bash scripts/unix/start-app-simplified.sh
        else
            echo "[INFO] Démarrage du serveur web simple..."
            npx http-server dist -p 8080 -c-1 --cors
        fi
        ;;
    *)
        echo "[INFO] Démarrage en mode développement avec React compatible..."
        VITE_FORCE_REACT_VERSION=18.2.0 npm run dev
        ;;
esac

exit 0
