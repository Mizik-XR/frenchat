
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

# Désactiver l'installation de Rust pour le déploiement
export NO_RUST_INSTALL=1
export NETLIFY_SKIP_PYTHON=true
export TRANSFORMERS_OFFLINE=1
export NODE_ENV=production

# Nettoyer les fichiers inutiles
echo "[INFO] Nettoyage des fichiers temporaires..."
if [ -d "dist" ]; then
    rm -rf dist
fi
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi

# Installation optimisée pour Netlify
echo "[INFO] Installation des dépendances avec configuration pour Netlify..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

# Préparer le build
echo "[ÉTAPE 2/3] Préparation du build pour déploiement..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction du projet a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Build prêt pour déploiement."
echo

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

echo "==================================================="
echo "     DÉPLOIEMENT TERMINÉ"
echo "==================================================="
echo
echo "N'oubliez pas de configurer les variables d'environnement"
echo "dans l'interface Netlify pour les fonctionnalités avancées."
echo
echo "Variables à configurer:"
echo "- VITE_SUPABASE_URL: URL de votre projet Supabase"
echo "- VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase"
echo "- VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)"
echo
echo "==================================================="
echo
echo "Vous pouvez maintenant partager le lien de déploiement avec le client."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
