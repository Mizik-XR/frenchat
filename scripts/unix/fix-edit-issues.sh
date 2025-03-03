
#!/bin/bash

# Mode silencieux si --silent est passé en paramètre
SILENT_MODE=0
if [ "$1" == "--silent" ]; then
    SILENT_MODE=1
fi

if [ $SILENT_MODE -eq 0 ]; then
    echo "==================================================="
    echo "     CORRECTION PROBLÈMES D'ÉDITION LOVABLE"
    echo "==================================================="
    echo
    echo "Cet outil va corriger le problème \"AI edits didn't result in any changes\""
    echo "en vérifiant que le script gptengineer.js est correctement intégré."
    echo
    echo "==================================================="
    echo
fi

# Vérifier et corriger index.html
if [ $SILENT_MODE -eq 0 ]; then
    echo "[ÉTAPE 1/3] Vérification du fichier index.html..."
fi

if [ -f "index.html" ]; then
    if [ $SILENT_MODE -eq 0 ]; then
        echo "[INFO] Vérification de la présence du script gptengineer.js..."
    fi
    
    if ! grep -q "gptengineer.js" "index.html"; then
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        fi
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Ajouter le script manquant avant le script principal
        sed -i '/<script type="module" src="\/src\/main.tsx"><\/script>/i \    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[OK] Script gptengineer.js ajouté dans index.html."
        fi
    else
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
        fi
    fi
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    if [ $SILENT_MODE -eq 0 ]; then
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    fi
    exit 1
fi

if [ $SILENT_MODE -eq 0 ]; then
    echo
fi

# Vérification dans le répertoire dist
if [ $SILENT_MODE -eq 0 ]; then
    echo "[ÉTAPE 2/3] Vérification du fichier dist/index.html..."
fi

if [ -f "dist/index.html" ]; then
    if [ $SILENT_MODE -eq 0 ]; then
        echo "[INFO] Vérification de la présence du script gptengineer.js dans le build..."
    fi
    
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[ATTENTION] Le script Lovable manque dans dist/index.html, correction..."
        fi
        
        # Copier le fichier index.html corrigé dans dist
        cp -f index.html dist/index.html
        
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[OK] Script gptengineer.js ajouté dans dist/index.html."
        fi
    else
        if [ $SILENT_MODE -eq 0 ]; then
            echo "[OK] Le script gptengineer.js est déjà présent dans dist/index.html."
        fi
    fi
else
    if [ $SILENT_MODE -eq 0 ]; then
        echo "[INFO] Le dossier dist n'existe pas ou n'a pas encore été généré."
    fi
fi

if [ $SILENT_MODE -eq 0 ]; then
    echo
fi

# Reconstruction de l'application
if [ $SILENT_MODE -eq 0 ]; then
    echo "[ÉTAPE 3/3] Reconstruction de l'application..."
fi

npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Veuillez exécuter fix-blank-page.sh pour une réparation complète."
    if [ $SILENT_MODE -eq 0 ]; then
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    fi
    exit 1
else
    if [ $SILENT_MODE -eq 0 ]; then
        echo "[OK] Application reconstruite avec succès."
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
    fi
fi

exit 0
