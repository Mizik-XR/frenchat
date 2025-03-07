
#!/bin/bash

echo "==================================================="
echo "    PRÉPARATION AU DÉPLOIEMENT NETLIFY"
echo "==================================================="
echo

# Exécuter le script de mise à jour du package.json
echo "[ÉTAPE 1/4] Mise à jour du package.json..."
node scripts/update-package-json.js
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la mise à jour du package.json"
    exit 1
fi
echo

# Vérifier l'existence du fichier _redirects à la racine
echo "[ÉTAPE 2/4] Vérification du fichier _redirects..."
if [ ! -f "_redirects" ]; then
    echo "[INFO] Création du fichier _redirects à la racine..."
    echo "/* /index.html 200" > _redirects
    echo "[OK] Fichier _redirects créé."
else
    echo "[OK] Le fichier _redirects existe déjà."
fi
echo

# Construction du projet
echo "[ÉTAPE 3/4] Construction du projet..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la construction du projet"
    exit 1
fi
echo

# Vérification finale
echo "[ÉTAPE 4/4] Vérification finale..."
if [ ! -f "dist/_redirects" ]; then
    echo "[ATTENTION] Le fichier _redirects n'a pas été copié dans dist."
    echo "[INFO] Copie manuelle du fichier _redirects..."
    cp _redirects dist/_redirects
    echo "[OK] Fichier _redirects copié dans dist."
else
    echo "[OK] Le fichier _redirects est présent dans dist."
fi

if [ -f "dist/index.html" ]; then
    echo "[OK] Le fichier index.html est présent dans dist."
else
    echo "[ERREUR] Le fichier index.html est manquant dans dist."
    exit 1
fi
echo

echo "==================================================="
echo "    PRÉPARATION AU DÉPLOIEMENT TERMINÉE"
echo "==================================================="
echo
echo "Votre projet est prêt à être déployé sur Netlify."
echo
echo "Assurez-vous que dans les paramètres Netlify:"
echo " 1. Le dossier de publication est configuré sur \"dist\""
echo " 2. La commande de build est \"npm run build\""
echo " 3. Toutes les variables d'environnement sont configurées"
echo
echo "Appuyez sur Entrée pour continuer..."
read
