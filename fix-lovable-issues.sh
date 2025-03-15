
#!/bin/bash

echo "==================================================="
echo "     CORRECTION AVANCÉE DES PROBLÈMES LOVABLE"
echo "==================================================="
echo

# Vérifier l'index.html
echo "[ÉTAPE 1/5] Vérification et correction de index.html..."
if [ -f "index.html" ]; then
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[CORRECTION] Ajout du script Lovable dans index.html"
        cp index.html index.html.backup
        
        # Insérer le script Lovable immédiatement après l'ouverture du head
        awk '/<head>/{print; print "    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>"; next}1' index.html > index.html.temp
        
        mv index.html.temp index.html
    else
        echo "[OK] Script Lovable présent dans index.html"
    fi
else
    echo "[ERREUR] Fichier index.html non trouvé"
    exit 1
fi
echo

# Nettoyer le cache npm
echo "[ÉTAPE 2/5] Nettoyage du cache npm..."
npm cache clean --force
echo "[OK] Cache npm nettoyé"
echo

# Nettoyer le dossier node_modules
echo "[ÉTAPE 3/5] Suppression des dépendances existantes..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "[OK] Dossier node_modules supprimé"
else
    echo "[INFO] Dossier node_modules non trouvé"
fi
echo

# Réinstaller les dépendances
echo "[ÉTAPE 4/5] Réinstallation des dépendances..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la réinstallation des dépendances"
    exit 1
else
    echo "[OK] Dépendances réinstallées avec succès"
fi
echo

# Reconstruire l'application
echo "[ÉTAPE 5/5] Reconstruction de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la reconstruction"
    exit 1
else
    echo "[OK] Application reconstruite avec succès"
fi
echo

echo "==================================================="
echo "     CORRECTION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo
echo "Pour appliquer les corrections:"
echo "1. Redémarrez l'application"
echo "2. Videz le cache de votre navigateur ou utilisez une fenêtre de navigation privée"
echo
echo "Si le problème persiste, essayez d'utiliser un autre navigateur"
echo "(Chrome ou Edge sont recommandés)"
echo

# Rendre le script exécutable
chmod +x fix-lovable-issues.sh

exit 0
