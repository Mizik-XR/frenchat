
#!/bin/bash

echo "==================================================="
echo "     DIAGNOSTIC ET RÉPARATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va diagnostiquer et résoudre les problèmes"
echo "d'intégration Lovable dans votre application."
echo
read -p "Appuyez sur Entrée pour démarrer la réparation..." -n1 -s
echo

# Vérification de l'intégration dans index.html
echo "[ÉTAPE 1/3] Vérification de index.html..."
if [ -f "index.html" ]; then
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[!] Script Lovable manquant dans index.html, correction..."
        
        # Sauvegarde de l'original
        cp index.html index.html.backup
        
        # Ajouter le script Lovable avant le script principal
        sed -i '/<script type="module" src="\/src\/main.tsx">/i \    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[✓] Script Lovable ajouté à index.html."
    else
        echo "[✓] Le script Lovable est présent dans index.html."
    fi
else
    echo "[✗] ERREUR: index.html introuvable. Avez-vous lancé ce script depuis le répertoire racine?"
    exit 1
fi
echo

# Vérification du build
echo "[ÉTAPE 2/3] Vérification du build..."
if [ -d "dist" ]; then
    if [ -f "dist/index.html" ]; then
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "[!] Script manquant dans le build, correction..."
            cp -f index.html dist/index.html
            echo "[✓] Script Lovable ajouté au build."
        else
            echo "[✓] Le script Lovable est présent dans le build."
        fi
    else
        echo "[!] Le fichier dist/index.html n'existe pas, un nouveau build est nécessaire."
    fi
else
    echo "[!] Le dossier dist n'existe pas, un build est nécessaire."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 3/3] Reconstruction de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[✗] La reconstruction a échoué. Vérifiez les erreurs."
else
    echo "[✓] Application reconstruite avec succès."
fi
echo

echo "==================================================="
echo "     DIAGNOSTIQUE TERMINÉ"
echo "==================================================="
echo
echo "Si vous continuez à rencontrer des problèmes:"
echo "1. Redémarrez l'application avec 'npm run dev'"
echo "2. Videz le cache de votre navigateur ou utilisez le mode incognito"
echo "3. Ouvrez la console développeur et exécutez: runLovableDiagnostic()"
echo
chmod +x fix-lovable-integration.sh
echo "[✓] Script rendu exécutable. Vous pouvez le lancer avec './fix-lovable-integration.sh'"
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0
