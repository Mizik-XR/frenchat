
#!/bin/bash

echo "==================================================="
echo "     CORRECTION PROBLÈMES D'ÉDITION LOVABLE"
echo "==================================================="
echo ""
echo "Cet outil va corriger le problème \"AI edits didn't result in any changes\""
echo "en vérifiant que le script gptengineer.js est correctement intégré."
echo ""
echo "==================================================="
echo ""

# Vérifier et corriger index.html
echo "[ÉTAPE 1/2] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Modification du fichier index.html pour ajouter le script manquant
        awk '/<script type="module" src="\/src\/main.tsx"><\/script>/ { 
            print "    <!-- Script requis pour Lovable fonctionnant comme \"Pick and Edit\" -->";
            print "    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>";
        }
        { print $0 }' index.html > index.html.temp
        
        mv index.html.temp index.html
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    exit 1
fi
echo ""

# Reconstruction de l'application
echo "[ÉTAPE 2/2] Reconstruction de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Veuillez exécuter fix-blank-page.sh pour une réparation complète."
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo ""

echo "==================================================="
echo "     CORRECTION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo ""
echo "Veuillez maintenant lancer l'application avec la commande:"
echo "npm run dev"
echo ""
echo "Si le problème persiste, exécutez ./scripts/unix/fix-blank-page.sh"
echo "pour une réparation plus complète."
echo ""
exit 0
