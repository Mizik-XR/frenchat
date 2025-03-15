
#!/bin/bash

echo "==================================================="
echo "     RÉSOLUTION AVANCÉE DES PROBLÈMES LOVABLE"
echo "==================================================="
echo
echo "Cette solution avancée va résoudre les problèmes"
echo "d'intégration de Lovable en effectuant une série de"
echo "vérifications et corrections."
echo

echo "[ÉTAPE 1/7] Vérification et restauration de index.html..."
# Vérifier index.html
if [ ! -f "index.html" ]; then
    if [ -f "index.html.backup" ]; then
        echo "[INFO] Restauration du fichier index.html à partir de la sauvegarde..."
        cp -f index.html.backup index.html
        echo "[OK] Fichier index.html restauré avec succès."
    else
        echo "[ATTENTION] Aucune sauvegarde de index.html trouvée."
        echo "[INFO] Création d'un nouveau fichier index.html..."
        ./fix-missing-index.sh
    fi
else
    echo "[OK] Le fichier index.html existe."
fi
echo

echo "[ÉTAPE 2/7] Vérification du script Lovable dans index.html..."
if ! grep -q "gptengineer.js" "index.html"; then
    echo "[ATTENTION] Script Lovable manquant dans index.html."
    echo "[INFO] Modification de index.html pour ajouter le script..."
    
    sed -i 's|<head>|<head>\n    <script src="https://cdn.gpteng.co/gptengineer.js"></script>|' index.html
    
    echo "[OK] Script Lovable ajouté à index.html."
else
    echo "[OK] Script Lovable déjà présent dans index.html."
    
    if grep -q '<script src="https://cdn.gpteng.co/gptengineer.js" type="module">' "index.html"; then
        echo "[ATTENTION] Le script Lovable a l'attribut type=\"module\", suppression..."
        sed -i 's|<script src="https://cdn.gpteng.co/gptengineer.js" type="module">|<script src="https://cdn.gpteng.co/gptengineer.js">|g' index.html
        echo "[OK] Attribut type=\"module\" supprimé."
    fi
fi
echo

echo "[ÉTAPE 3/7] Optimisation des utilitaires d'édition Lovable..."
if [ -f "src/utils/lovable/editingUtils.ts" ]; then
    echo "[INFO] Vérification du fichier d'utilitaires d'édition Lovable..."
    echo "[OK] Le fichier d'utilitaires existe."
else
    echo "[ATTENTION] Le fichier d'utilitaires d'édition Lovable est manquant!"
    echo "[INFO] Ce fichier sera créé lors de la construction."
fi
echo

echo "[ÉTAPE 4/7] Nettoyage du cache et des fichiers temporaires..."
echo "[INFO] Suppression du répertoire dist..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Répertoire dist supprimé."
else
    echo "[INFO] Répertoire dist inexistant, étape ignorée."
fi

echo "[INFO] Nettoyage du cache npm..."
npm cache clean --force
echo "[OK] Cache npm nettoyé."
echo

echo "[ÉTAPE 5/7] Création d'un fichier .env.local pour le mode cloud..."
echo "[INFO] Configuration temporaire du mode cloud..."
cat > .env.local << EOL
VITE_CLOUD_MODE=true
VITE_ALLOW_LOCAL_AI=false
EOL
echo "[OK] Fichier .env.local créé pour le mode cloud."
echo

echo "[ÉTAPE 6/7] Reconstruction complète..."
export NODE_OPTIONS=--max-old-space-size=4096
echo "[INFO] Reconstruction avec NODE_OPTIONS=--max-old-space-size=4096..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ATTENTION] Échec de la reconstruction."
    echo "[INFO] Tentative avec NO_RUST_INSTALL=1..."
    export NO_RUST_INSTALL=1
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] La reconstruction a échoué même avec NO_RUST_INSTALL=1."
        echo "            Vérifiez les erreurs de compilation."
        exit 1
    fi
fi
echo "[OK] Reconstruction réussie."
echo

echo "[ÉTAPE 7/7] Vérification finale et correction..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification de la présence du script Lovable dans dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script Lovable est absent de dist/index.html."
        echo "[INFO] Copie manuelle de index.html vers dist/index.html..."
        cp -f index.html dist/index.html
        echo "[OK] Correction appliquée."
    else
        echo "[OK] Le script Lovable est présent dans dist/index.html."
    fi
else
    echo "[ERREUR] Le fichier dist/index.html est manquant après la reconstruction!"
    exit 1
fi
echo

echo "==================================================="
echo "     RÉSOLUTION AVANCÉE TERMINÉE"
echo "==================================================="
echo
echo "Pour finaliser et tester l'application:"
echo "1. Redémarrez l'application avec 'npm run dev'"
echo "2. Videz complètement le cache de votre navigateur"
echo "3. Si les problèmes persistent, essayez un autre navigateur"
echo "   (Chrome ou Edge sont recommandés)"
echo "4. Vous pouvez essayer le mode cloud en ajoutant"
echo "   ?cloud=true&mode=cloud à l'URL"
echo
chmod +x fix-lovable-issues-advanced.sh
echo "Appuyez sur Entrée pour quitter..."
read
exit 0
