
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
echo "2. Vérification de Rust/Cargo"
echo "3. Préparation du build pour déploiement"
echo "4. Déploiement vers Netlify"
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

# Vérifier si Rust/Cargo est installé
echo "[ÉTAPE 1/4] Vérification de Rust/Cargo..."
if command -v rustc >/dev/null 2>&1 && command -v cargo >/dev/null 2>&1; then
    echo "[OK] Rust et Cargo sont déjà installés:"
    rustc --version
    cargo --version
else
    echo "[INFO] Rust/Cargo n'est pas installé. Installation en cours..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    
    # Mettre à jour le PATH pour cette session
    source "$HOME/.cargo/env"
    
    # Vérifier l'installation
    if command -v rustc >/dev/null 2>&1 && command -v cargo >/dev/null 2>&1; then
        echo "[OK] Rust et Cargo installés avec succès:"
        rustc --version
        cargo --version
    else
        echo "[ATTENTION] L'installation automatique de Rust a échoué."
        echo "            Vous pouvez continuer en mode sans Rust."
        echo "            Définissez NO_RUST_INSTALL=1 pour l'installation Python."
        export NO_RUST_INSTALL=1
    fi
fi
echo

# Préparer le build
echo "[ÉTAPE 2/4] Préparation du build pour déploiement..."
bash scripts/unix/prepare-deployment.sh
if [ $? -ne 0 ]; then
    echo "[ERREUR] La préparation du déploiement a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Build prêt pour déploiement."
echo

# Vérifier la connexion à Netlify
echo "[ÉTAPE 3/4] Vérification de la connexion à Netlify..."
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
echo "[ÉTAPE 4/4] Déploiement vers Netlify..."
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
