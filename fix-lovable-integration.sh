
#!/bin/bash

echo "==================================================="
echo "     RÉPARATION INTÉGRATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va résoudre les problèmes d'édition Lovable."
echo

echo "[ÉTAPE 1/3] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Ajouter le script manquant après la première balise script détectée
        sed -i '/<script/i\    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    exit 1
fi
echo

echo "[ÉTAPE 2/3] Reconstruction de l'application..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo

echo "[ÉTAPE 3/3] Vérification finale..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification de dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script gptengineer.js est absent de dist/index.html."
        echo "            Application d'une correction manuelle..."
        cp -f index.html dist/index.html
        echo "[OK] Correction appliquée."
    else
        echo "[OK] Le fichier dist/index.html contient le script requis."
    fi
else
    echo "[INFO] Le dossier dist n'existe pas encore."
fi
echo

echo "==================================================="
echo "     RÉPARATION TERMINÉE"
echo "==================================================="
echo
echo "Pour appliquer les changements:"
echo "1. Redémarrez l'application"
echo "2. Videz le cache de votre navigateur ou utilisez le mode incognito"
echo

# Rendre le script exécutable
chmod +x fix-lovable-integration.sh
echo "Le script est maintenant exécutable avec ./fix-lovable-integration.sh"
exit 0
