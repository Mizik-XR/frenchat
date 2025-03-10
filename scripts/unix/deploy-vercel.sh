
#!/bin/bash

echo "==================================================="
echo "     DÉPLOIEMENT FILECHAT VERS VERCEL"
echo "==================================================="
echo

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "[INFO] Vercel CLI n'est pas installé, installation en cours..."
    npm install -g vercel
    
    # Vérifier si l'installation a réussi
    if ! command -v vercel &> /dev/null; then
        echo "[ERREUR] L'installation automatique a échoué, tentative avec une autre méthode..."
        # Essayer avec l'option --force
        npm install -g vercel --force
        
        # Vérifier à nouveau
        if ! command -v vercel &> /dev/null; then
            echo "[ERREUR] Installation de Vercel CLI impossible."
            echo "Essayez manuellement avec: 'npm install -g vercel' ou 'yarn global add vercel'"
            echo "Ou utilisez npx: utilisez 'npx vercel' à la place de 'vercel' dans les commandes"
            
            # Demander à l'utilisateur s'il veut continuer avec npx
            read -p "Voulez-vous continuer avec npx vercel? (o/n): " use_npx
            if [ "$use_npx" != "o" ] && [ "$use_npx" != "O" ]; then
                echo "Déploiement annulé."
                exit 1
            fi
            
            # Si l'utilisateur veut continuer, utiliser npx
            VERCEL_CMD="npx vercel"
        else
            echo "[OK] Vercel CLI installé avec succès (méthode alternative)."
            VERCEL_CMD="vercel"
        fi
    else
        echo "[OK] Vercel CLI installé avec succès."
        VERCEL_CMD="vercel"
    fi
else
    echo "[OK] Vercel CLI déjà installé."
    VERCEL_CMD="vercel"
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
$VERCEL_CMD whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "[INFO] Vous n'êtes pas connecté à Vercel. Connexion en cours..."
    $VERCEL_CMD login
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
    $VERCEL_CMD
else
    echo "[INFO] Déploiement en production..."
    $VERCEL_CMD --prod
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
