
#!/bin/bash

echo "==================================================="
echo "    FILECHAT PRÉPARATION AU DÉPLOIEMENT"
echo "==================================================="
echo
echo "Cette procédure va préparer le projet pour le déploiement:"
echo " 1. Vérification des fichiers de configuration"
echo " 2. Optimisation du build"
echo " 3. Tests pré-déploiement"
echo " 4. Correction des problèmes de MIME types connus"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo

# Nettoyage des fichiers temporaires
echo "[ÉTAPE 1/5] Nettoyage des fichiers temporaires..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé avec succès."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Configuration pour le déploiement
export NODE_ENV=production

# Vérification et préparation des fichiers de configuration
echo "[ÉTAPE 2/5] Vérification des fichiers de configuration..."
if [ ! -f "vercel.json" ]; then
    echo "[ERREUR] Le fichier vercel.json est manquant."
    echo "         Exécutez le script de génération de configuration."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Optimisation et build
echo "[ÉTAPE 3/5] Optimisation et build du projet..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Installation optimisée pour le déploiement
echo "[INFO] Installation des dépendances avec configuration optimisée..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec du build du projet."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Projet compilé avec succès."
echo

# Vérification post-build
echo "[ÉTAPE 4/5] Vérification des fichiers de déploiement..."
if [ ! -f "dist/index.html" ]; then
    echo "[ERREUR] Le fichier dist/index.html est manquant."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Vérification et correction des chemins absolus dans index.html
if grep -q "href=\"/assets" "dist/index.html" || grep -q "src=\"/assets" "dist/index.html"; then
    echo "[ATTENTION] Chemins absolus détectés dans index.html, conversion en chemins relatifs..."
    sed -i.bak 's|href="/assets|href="./assets|g' dist/index.html
    sed -i.bak 's|src="/assets|src="./assets|g' dist/index.html
    rm -f dist/index.html.bak
    echo "[OK] Chemins convertis avec succès."
fi

# Correction des problèmes de MIME types
echo "[ÉTAPE 5/5] Correction des problèmes de MIME types pour Vercel..."
node scripts/fix-vercel-mime-types.js
if [ $? -ne 0 ]; then
    echo "[ATTENTION] Des problèmes ont été rencontrés lors de la correction des MIME types."
    echo "            Le déploiement peut continuer, mais des erreurs pourraient survenir."
else
    echo "[OK] Corrections des MIME types appliquées avec succès."
fi

echo
echo "==================================================="
echo "    PRÉPARATION AU DÉPLOIEMENT TERMINÉE"
echo "==================================================="
echo
echo "Votre projet est prêt à être déployé !"
echo
echo "Vous pouvez maintenant :"
echo " 1. Déployer sur Vercel en connectant votre dépôt GitHub"
echo " 2. Déployer via la CLI Vercel : vercel deploy"
echo " 3. Utiliser le glisser-déposer du dossier 'dist' sur l'interface Vercel"
echo
echo "N'oubliez pas de configurer les variables d'environnement dans l'interface Vercel."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
