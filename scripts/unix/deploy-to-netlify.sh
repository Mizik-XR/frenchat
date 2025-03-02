
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
echo "2. Configuration des variables d'environnement Netlify"
echo "3. Déploiement vers Netlify"
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

# Configuration des variables d'environnement
echo "[INFO] Configuration des variables d'environnement..."
read -p "Entrez l'URL Supabase (https://dbdueopvtlanxgumenpu.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    SUPABASE_URL="https://dbdueopvtlanxgumenpu.supabase.co"
fi

read -p "Entrez la clé anonyme Supabase: " SUPABASE_KEY
if [ -z "$SUPABASE_KEY" ]; then
    echo "[ERREUR] La clé Supabase est requise."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Déployer vers Netlify
echo "[ÉTAPE 3/3] Déploiement vers Netlify..."
netlify deploy --prod --dir=dist --env.VITE_SUPABASE_URL="$SUPABASE_URL" --env.VITE_SUPABASE_ANON_KEY="$SUPABASE_KEY"
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
echo "N'oubliez pas de vérifier les variables d'environnement"
echo "dans l'interface Netlify pour les fonctionnalités avancées."
echo
echo "Pour continuer à configurer votre site, allez sur le tableau de bord Netlify."
echo
echo "==================================================="
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
