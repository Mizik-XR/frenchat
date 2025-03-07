
#!/bin/bash

echo "==================================================="
echo "    DÉPLOIEMENT FILECHAT VERS NETLIFY"
echo "==================================================="
echo
echo "Ce script va déployer FileChat vers Netlify."
echo "Assurez-vous d'avoir installé la CLI Netlify et"
echo "d'être connecté à votre compte Netlify."
echo
echo "Étapes:"
echo "1. Vérification de l'environnement"
echo "2. Préparation du build pour déploiement"
echo "3. Déploiement vers Netlify"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo

# Vérifier si netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "[INFO] La CLI Netlify n'est pas installée, installation en cours..."
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo "[ERREUR] L'installation de la CLI Netlify a échoué."
        echo
        echo "Pour l'installer manuellement, exécutez:"
        echo "npm install -g netlify-cli"
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
    echo "[OK] CLI Netlify installée avec succès."
fi

# Configuration de l'environnement pour Netlify
export NO_RUST_INSTALL=1
export NETLIFY_SKIP_PYTHON=true
export TRANSFORMERS_OFFLINE=1
export NODE_ENV=production
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export SKIP_PYTHON_INSTALLATION=true
export NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Nettoyer les fichiers inutiles
echo "[INFO] Nettoyage des fichiers temporaires..."
if [ -d "dist" ]; then
    rm -rf dist
fi

# Installation optimisée pour Netlify
echo "[INFO] Installation des dépendances avec configuration pour Netlify..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

# Vérifier la configuration Netlify
echo "[ÉTAPE 1/3] Vérification de la configuration Netlify..."
node scripts/ensure-netlify-build.js
if [ $? -ne 0 ]; then
    echo "[ATTENTION] Des problèmes ont été détectés avec la configuration Netlify."
    echo "[INFO] Continuons malgré tout, le script tentera d'appliquer des corrections."
fi

# Préparer le build
echo "[ÉTAPE 2/3] Préparation du build pour déploiement..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction du projet a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Build prêt pour déploiement."
echo

# Vérifier les chemins absolus dans le build
bash scripts/verify-netlify-deployment.sh
echo "[OK] Vérification et correction des chemins terminées."

# Vérification de la connexion à Netlify
echo "[ÉTAPE 3/3] Vérification de la connexion à Netlify..."
netlify status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[INFO] Vous n'êtes pas connecté à Netlify."
    echo "[INFO] Connexion à Netlify..."
    netlify login
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Échec de la connexion à Netlify."
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
fi
echo "[OK] Connecté à Netlify."
echo

# Déployer vers Netlify
echo "[INFO] Voulez-vous:"
echo "1. Déployer une prévisualisation (preview)"
echo "2. Déployer en production"
read -p "Choisissez une option (1 ou 2): " choice

if [ "$choice" = "1" ]; then
    echo "[INFO] Déploiement d'une prévisualisation..."
    netlify deploy --dir=dist
else
    echo "[INFO] Déploiement en production..."
    netlify deploy --prod --dir=dist
fi

if [ $? -ne 0 ]; then
    echo "[ERREUR] Le déploiement a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Déploiement terminé avec succès."
echo

echo "[SÉCURITÉ] IMPORTANT: Configuration des variables d'environnement"
echo "==================================================="
echo
echo "N'oubliez pas de configurer les variables d'environnement"
echo "dans l'interface Netlify pour protéger vos clés API."
echo
echo "Variables à configurer:"
echo "- VITE_SUPABASE_URL: URL de votre projet Supabase"
echo "- VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase"
echo "- VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)"
echo
echo "Méthode sécurisée:"
echo "1. Accédez à votre projet dans l'interface Netlify"
echo "2. Allez dans 'Site settings' -> 'Environment variables'"
echo "3. Ajoutez les variables ci-dessus sans les stocker dans le code"
echo
echo "==================================================="
echo
echo "Vous pouvez maintenant partager le lien de déploiement avec le client."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
