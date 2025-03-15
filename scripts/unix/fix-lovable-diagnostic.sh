
#!/bin/bash

echo "==================================================="
echo "     DIAGNOSTIC AVANCÉ D'INTÉGRATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va diagnostiquer et tenter de corriger les problèmes"
echo "d'intégration Lovable (gptengineer.js) dans votre application."
echo

# Vérifier la présence du fichier index.html
echo "[TEST 1/5] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[OK] Le fichier index.html existe."
else
    echo "[ERREUR] Le fichier index.html est manquant!"
    
    if [ -f "index.html.backup" ]; then
        echo "[CORRECTION] Restauration à partir de la sauvegarde..."
        cp -f index.html.backup index.html
        echo "[OK] Fichier index.html restauré."
    else
        echo "[ERREUR CRITIQUE] Aucune sauvegarde disponible!"
        echo "Exécutez fix-missing-index.sh pour créer un nouveau fichier index.html."
        exit 1
    fi
fi
echo

# Vérifier le script Lovable dans index.html
echo "[TEST 2/5] Vérification du script Lovable..."
if grep -q "gptengineer.js" "index.html"; then
    echo "[OK] Script Lovable trouvé dans index.html."
    
    # Vérifier si le script a l'attribut type="module"
    if grep -q '<script src="https://cdn.gpteng.co/gptengineer.js" type="module">' "index.html"; then
        echo "[ATTENTION] Le script Lovable a l'attribut type=\"module\", suppression..."
        sed -i 's|<script src="https://cdn.gpteng.co/gptengineer.js" type="module">|<script src="https://cdn.gpteng.co/gptengineer.js">|g' "index.html"
        echo "[OK] Attribut type=\"module\" supprimé."
    fi
else
    echo "[ERREUR] Script Lovable manquant dans index.html, ajout..."
    sed -i 's|<head>|<head>\n    <script src="https://cdn.gpteng.co/gptengineer.js"></script>|' "index.html"
    echo "[OK] Script Lovable ajouté à index.html."
fi
echo

# Vérifier l'état de l'objet global
echo "[TEST 3/5] Vérification des fichiers principaux..."
if [ -f "src/main.tsx" ]; then
    echo "[OK] Le fichier src/main.tsx existe."
else
    echo "[ERREUR] Le fichier src/main.tsx est manquant!"
fi

if [ -f "src/utils/lovable/editingUtils.ts" ]; then
    echo "[OK] Le fichier utilitaire d'édition Lovable existe."
else
    echo "[ERREUR] Le fichier utilitaire d'édition Lovable est manquant!"
fi
echo

# Tester la construction
echo "[TEST 4/5] Test de construction rapide..."
echo "[INFO] Tentative de construction..."
npm run build
if [ $? -eq 0 ]; then
    echo "[OK] Construction réussie."
else
    echo "[ERREUR] Échec de la construction."
fi
echo

# Vérifier l'adaptation du mode cloud
echo "[TEST 5/5] Test d'adaptation au mode cloud..."
if [ -f ".env.local" ]; then
    echo "[INFO] Fichier .env.local détecté."
else
    echo "[INFO] Création d'un fichier .env.local pour le mode cloud..."
    echo "VITE_CLOUD_MODE=true" > .env.local
    echo "VITE_ALLOW_LOCAL_AI=false" >> .env.local
    echo "[OK] Fichier .env.local créé pour le mode cloud."
fi
echo

echo "==================================================="
echo "     DIAGNOSTIC TERMINÉ"
echo "==================================================="
echo
echo "Si les problèmes persistent:"
echo "1. Exécutez ./fix-missing-index.sh pour restaurer index.html"
echo "2. Videz le cache de votre navigateur ou utilisez le mode incognito"
echo "3. Essayez un autre navigateur (Chrome ou Edge recommandés)"
echo "4. Utilisez le mode cloud avec index.html?cloud=true&mode=cloud"
echo
chmod +x scripts/unix/fix-lovable-diagnostic.sh
echo "Appuyez sur Entrée pour quitter..."
read
exit 0
