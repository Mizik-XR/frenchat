
#!/bin/bash

echo "==================================================="
echo "     RÉPARATION INTÉGRATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va résoudre les problèmes d'édition avec Lovable"
echo "et le problème \"AI edits didn't result in any changes\"."
echo

# Vérification de index.html
echo "[ÉTAPE 1/4] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Créer un fichier temporaire avec le script Lovable au bon endroit
        cat > index.html.temp << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frenchat - Votre assistant d'intelligence documentaire</title>
    <meta name="description" content="Frenchat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." />
    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" - Position optimisée -->
    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
EOF
        
        # Ajouter le reste du fichier original sans les lignes déjà ajoutées
        grep -v -e "<!DOCTYPE html>" -e "<html " -e "<head>" -e "<meta charset" -e "<link rel=\"icon\"" -e "<meta name=\"viewport\"" -e "<title>" -e "<meta name=\"description\"" "index.html" >> index.html.temp
        
        mv index.html.temp index.html
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    exit 1
fi
echo

# Nettoyer les fichiers de build
echo "[ÉTAPE 2/4] Nettoyage du dossier dist..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 3/4] Reconstruction complète de l'application..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo

# Vérification finale
echo "[ÉTAPE 4/4] Vérification finale..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification de dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script Lovable est absent de dist/index.html."
        echo "             Application d'une correction manuelle..."
        
        cp index.html dist/index.html
        echo "[OK] Correction appliquée."
    else
        echo "[OK] Le fichier dist/index.html contient le script requis."
    fi
else
    echo "[INFO] Le dossier dist/index.html n'existe pas. Vérifiez la construction."
fi
echo

echo "==================================================="
echo "     RÉPARATION TERMINÉE"
echo "==================================================="
echo
echo "Le problème \"AI edits didn't result in any changes\" devrait être résolu."
echo
echo "Pour que les changements prennent effet:"
echo "1. Redémarrez l'application"
echo "2. Videz le cache de votre navigateur ou utilisez le mode incognito"
echo "3. Si le problème persiste, essayez un autre navigateur (Chrome ou Edge)"
echo
chmod +x fix-lovable-integration.sh
exit 0
