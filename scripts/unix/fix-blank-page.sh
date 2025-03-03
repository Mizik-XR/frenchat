
#!/bin/bash

echo "==================================================="
echo "    OUTIL DE RÉPARATION FILECHAT"
echo "==================================================="
echo
echo "Cet outil va tenter de résoudre les problèmes suivants:"
echo
echo "[1] Page blanche après chargement"
echo "[2] Erreur \"AI edits didn't result in any changes\""
echo "[3] Problèmes d'édition avec Lovable"
echo "[4] Erreurs liées à Supabase ou variables d'environnement"
echo "[5] Erreurs de typage TypeScript"
echo "[6] Erreurs de compatibilité React"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour démarrer la réparation..." -n1 -s
echo

# Nettoyer le dossier dist
echo "[ÉTAPE 1/7] Nettoyage du dossier dist..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé avec succès."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Vérifier et corriger index.html
echo "[ÉTAPE 2/7] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Ajouter le script manquant
        awk '/<script type="module" src="\/src\/main.tsx"><\/script>/{print "    <!-- Script requis pour Lovable fonctionnant comme \"Pick and Edit\" -->\n    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>"}1' index.html > index.html.temp
        
        mv index.html.temp index.html
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ATTENTION] Le fichier index.html est manquant dans le répertoire racine."
    echo "             Création d'un fichier index.html basique..."
    
    cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FileChat - Votre assistant d'intelligence documentaire</title>
    <meta name="description" content="FileChat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." />
  </head>
  <body>
    <div id="root"></div>
    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->
    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
    
    echo "[OK] Fichier index.html créé avec succès."
fi
echo

# Vérification des variables d'environnement
echo "[ÉTAPE 3/7] Vérification de la configuration Supabase..."
echo "[INFO] Création d'un fichier .env.local de secours avec configuration Supabase..."

cat > .env.local << EOF
VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
EOF

echo "[OK] Fichier .env.local créé avec la configuration Supabase."
echo

# Correction des problèmes de compatibilité React
echo "[ÉTAPE 4/7] Correction des problèmes de compatibilité React..."
echo "[INFO] Réinstallation des dépendances React..."

npm uninstall react react-dom
npm cache clean --force
npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0

echo "[OK] Dépendances React réinstallées."
echo

# Vérification des erreurs de typage
echo "[ÉTAPE 5/7] Vérification des erreurs TypeScript..."
echo "[INFO] Exécution du vérificateur de types..."

# Vérifier si tsc est disponible
if command -v npx >/dev/null 2>&1; then
    npx tsc --noEmit
    if [ $? -ne 0 ]; then
        echo "[ATTENTION] Des erreurs de typage TypeScript ont été détectées."
        echo "            Ces erreurs peuvent être ignorées pour la compilation mais pourraient causer des problèmes."
    else
        echo "[OK] Aucune erreur de typage TypeScript détectée."
    fi
else
    echo "[INFO] TypeScript n'est pas disponible, étape ignorée."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 6/7] Reconstruction complète de l'application..."
echo "[INFO] Utilisation de NODE_OPTIONS=--max-old-space-size=4096..."
export NODE_OPTIONS=--max-old-space-size=4096
npm run build -- --force
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Tentative avec NO_RUST_INSTALL=1..."
    export NO_RUST_INSTALL=1
    npm run build -- --force
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Reconstruction de l'application échouée."
        echo "         Veuillez vérifier les erreurs de compilation."
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
else
    echo "[OK] Application reconstruite avec succès."
fi

# Vérification finale et démarrage du serveur
echo "[ÉTAPE 7/7] Vérification finale et démarrage..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification de dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script gptengineer.js est absent de dist/index.html."
        echo "            Application d'une correction manuelle..."
        
        # Maintenant nous copions le fichier modifié pour s'assurer que le script est inclus
        cat "index.html" > "dist/index.html"
        echo "[OK] Correction appliquée à dist/index.html."
    else
        echo "[OK] Le fichier dist/index.html contient le script requis."
    fi
    
    echo "[INFO] Démarrage du serveur web..."
    echo "[INFO] Serveur démarré sur http://localhost:8080"
    if command -v http-server >/dev/null 2>&1; then
        http-server dist -p 8080 -c-1 --cors
    else
        echo "[INFO] Installation de http-server..."
        npm install -g http-server
        http-server dist -p 8080 -c-1 --cors
    fi
else
    echo "[ERREUR] Le fichier dist/index.html n'existe pas après la reconstruction."
    echo "         Veuillez vérifier les erreurs de compilation."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

echo "==================================================="
echo "           RÉPARATION TERMINÉE"
echo "==================================================="
echo
echo "Si l'application ne s'affiche pas correctement:"
echo " 1. Essayez de vider le cache de votre navigateur"
echo " 2. Utilisez le mode incognito"
echo " 3. Essayez un navigateur différent"
echo
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0
