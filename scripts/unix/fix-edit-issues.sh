
#!/bin/bash

echo "==================================================="
echo "     CORRECTION PROBLÈMES D'ÉDITION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va corriger le problème \"AI edits didn't result in any changes\""
echo "en vérifiant que le script gptengineer.js est correctement intégré."
echo
echo "==================================================="
echo

# Vérifier et corriger index.html
echo "[ÉTAPE 1/3] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Ajouter le script manquant avant le script principal
        sed -i '/<script type="module" src="\/src\/main.tsx"><\/script>/i \    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo

# Vérification dans le répertoire dist
echo "[ÉTAPE 2/3] Vérification du fichier dist/index.html..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js dans le build..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans dist/index.html, correction..."
        
        # Copier le fichier index.html corrigé dans dist
        cp -f index.html dist/index.html
        echo "[OK] Script gptengineer.js ajouté dans dist/index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans dist/index.html."
    fi
else
    echo "[INFO] Le dossier dist n'existe pas ou n'a pas encore été généré."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 3/3] Reconstruction de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Veuillez exécuter fix-blank-page.sh pour une réparation complète."
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo

echo "==================================================="
echo "     CORRECTION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo
echo "La correction du problème d'édition est terminée."
echo
echo "Si vous êtes en train d'utiliser l'application:"
echo "1. Fermez-la et relancez-la avec start-app-simplified.sh"
echo "2. Effacez le cache de votre navigateur ou utilisez le mode incognito"
echo
echo "Si le problème persiste:"
echo "1. Essayez d'utiliser Chrome ou Edge au lieu de Firefox"
echo "2. Vérifiez que JavaScript est activé dans votre navigateur"
echo
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0
