
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
echo "1. Préparation du build pour déploiement"
echo "2. Déploiement vers Netlify"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo

# Vérifier si netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "[ERREUR] La CLI Netlify n'est pas installée."
    echo
    echo "Pour l'installer, exécutez:"
    echo "npm install -g netlify-cli"
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Préparer le build
echo "[ÉTAPE 1/3] Préparation du build pour déploiement..."
bash scripts/unix/prepare-deployment.sh > /dev/null
if [ $? -ne 0 ]; then
    echo "[ERREUR] La préparation du déploiement a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Build prêt pour déploiement."
echo

# Vérifier la connexion à Netlify
echo "[ÉTAPE 2/3] Vérification de la connexion à Netlify..."
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
echo "[ÉTAPE 3/3] Déploiement vers Netlify..."
netlify deploy --prod --dir=dist
if [ $? -ne 0 ]; then
    echo "[ERREUR] Le déploiement a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Déploiement terminé avec succès."
echo

echo "==================================================="
echo "    DÉPLOIEMENT TERMINÉ"
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
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
