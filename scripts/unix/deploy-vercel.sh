
#!/bin/bash

echo "==================================================="
echo "     DÉPLOIEMENT FILECHAT VERS VERCEL"
echo "==================================================="
echo

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "[INFO] Vercel CLI n'est pas installé, installation en cours..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "[ERREUR] L'installation de Vercel CLI a échoué."
        echo "Pour l'installer manuellement, exécutez: npm install -g vercel"
        exit 1
    fi
    echo "[OK] Vercel CLI installé avec succès."
fi

# Configuration pour le déploiement
export NODE_ENV=production
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export SKIP_PYTHON_INSTALLATION=true

# Nettoyer les fichiers de build précédents
echo "[INFO] Nettoyage des fichiers temporaires..."
rm -rf dist

# Installation des dépendances
echo "[INFO] Installation des dépendances..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

# Construction du projet
echo "[ÉTAPE 2/5] Construction du projet..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction du projet a échoué."
    exit 1
fi
echo "[OK] Build terminé avec succès."

# Configurer les headers Vercel pour les types MIME
echo "[ÉTAPE 3/5] Configuration des headers pour types MIME..."
node scripts/vercel-headers.js
if [ $? -ne 0 ]; then
    echo "[ATTENTION] La configuration des headers a échoué, mais le déploiement continue."
fi

# Vérification de la connexion à Vercel
echo "[ÉTAPE 4/5] Vérification de la connexion à Vercel..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "[INFO] Vous n'êtes pas connecté à Vercel. Connexion en cours..."
    vercel login
    if [ $? -ne 0 ]; then
        echo "[ERREUR] La connexion à Vercel a échoué."
        exit 1
    fi
fi
echo "[OK] Connecté à Vercel."

# Choix du type de déploiement
echo "[ÉTAPE 5/5] Choisissez le type de déploiement:"
echo "1. Déploiement de prévisualisation"
echo "2. Déploiement en production"
read -p "Votre choix (1/2): " choice

if [ "$choice" = "1" ]; then
    echo "[INFO] Déploiement d'une prévisualisation..."
    vercel
else
    echo "[INFO] Déploiement en production..."
    vercel --prod
fi

if [ $? -ne 0 ]; then
    echo "[ERREUR] Le déploiement a échoué."
    exit 1
fi
echo "[OK] Déploiement terminé avec succès."

echo "==================================================="
echo "     DÉPLOIEMENT TERMINÉ"
echo "==================================================="
echo
echo "N'oubliez pas de configurer les variables d'environnement"
echo "dans l'interface Vercel pour les fonctionnalités avancées."
echo
echo "Variables à configurer:"
echo "- VITE_SUPABASE_URL: URL de votre projet Supabase"
echo "- VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase"
echo "- VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)"
echo
echo "==================================================="
