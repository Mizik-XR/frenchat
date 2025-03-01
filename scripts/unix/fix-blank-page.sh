
#!/bin/bash

echo "==================================================="
echo "    OUTIL DE RÉPARATION FILECHAT"
echo "==================================================="
echo
echo "Cet outil va tenter de résoudre le problème de page blanche"
echo "en effectuant les opérations suivantes:"
echo
echo "[1] Nettoyage complet du dossier dist"
echo "[2] Vérification et correction du fichier index.html"
echo "[3] Reconstruction forcée de l'application"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour démarrer la réparation..." -n1 -s
echo

# Nettoyer le dossier dist
echo "[ÉTAPE 1/3] Nettoyage du dossier dist..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé avec succès."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Vérifier et corriger index.html
echo "[ÉTAPE 2/3] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Ajouter le script manquant
        sed -i '/<script type="module" src="\/src\/main.tsx"><\/script>/i \    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[OK] Le script gptengineer.js est déjà présent dans index.html."
    fi
else
    echo "[ATTENTION] Le fichier index.html est manquant dans le répertoire racine."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 3/3] Reconstruction forcée de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Vérifiez les messages d'erreur ci-dessus."
    echo
    echo "Réparation terminée avec erreurs. Veuillez contacter le support technique."
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo

echo "==================================================="
echo "    RÉPARATION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo
echo "Veuillez maintenant lancer l'application avec:"
echo "- Sur Windows: ./start-app.bat"
echo "- Sur Mac/Linux: ./scripts/unix/start-app-simplified.sh"
echo
echo "Si le problème persiste, essayez également:"
echo "1. Vérifier avec ./scripts/unix/diagnostic.sh ou ./scripts/diagnostic.bat"
echo "2. Lancer en mode cloud avec ./start-cloud-mode.bat"
echo
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0
