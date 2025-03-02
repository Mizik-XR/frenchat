
#!/bin/bash

echo "==================================================="
echo "    PRÉPARATION DU DÉPLOIEMENT FILECHAT"
echo "==================================================="
echo
echo "Cette procédure va préparer le projet pour déploiement:"
echo " 1. Vérification des fichiers de configuration"
echo " 2. Vérification de Rust/Cargo (pour les dépendances Python)"
echo " 3. Optimisation du build"
echo " 4. Tests de pré-déploiement"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo

# Nettoyer les fichiers inutiles
echo "[ÉTAPE 1/5] Nettoyage des fichiers temporaires..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé avec succès."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Vérifier et installer Rust si nécessaire
echo "[ÉTAPE 2/5] Vérification de Rust/Cargo pour les dépendances Python..."
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
        echo "            Vous pouvez l'installer manuellement: https://rustup.rs/"
        echo "            Puis redémarrer ce script."
        echo
        echo "            Si vous êtes sur Netlify, vous pouvez ignorer cette étape"
        echo "            et utiliser le mode NO_RUST_INSTALL=1."
    fi
fi
echo

# Vérifier et préparer les fichiers de configuration
echo "[ÉTAPE 3/5] Vérification des fichiers de configuration..."
if [ ! -f "netlify.toml" ]; then
    echo "[ERREUR] Le fichier netlify.toml est manquant."
    echo "         Exécutez le script de génération de configuration."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Optimisation du build
echo "[ÉTAPE 4/5] Optimisation et build du projet..."
export NODE_OPTIONS="--max-old-space-size=4096"
# Option pour installer les dépendances Python sans Rust si nécessaire
if [ "$NO_RUST_INSTALL" = "1" ]; then
    echo "[INFO] Mode sans Rust activé pour les dépendances Python."
    export NO_RUST_INSTALL=1
fi
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction du projet a échoué."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi
echo "[OK] Projet construit avec succès."
echo

# Vérification post-build
echo "[ÉTAPE 5/5] Vérification des fichiers de déploiement..."
if [ ! -f "dist/index.html" ]; then
    echo "[ERREUR] Le fichier dist/index.html est manquant."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Vérifier que le script Lovable est bien présent
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Le script Lovable manque dans index.html."
    bash scripts/unix/fix-blank-page.sh
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Impossible de corriger le problème."
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
    echo "[OK] Correction appliquée avec succès."
fi

# Vérification des chemins relatifs dans index.html
if grep -q "href=\"/assets" "dist/index.html" || grep -q "src=\"/assets" "dist/index.html"; then
    echo "[ATTENTION] Chemins absolus détectés dans index.html, conversion en chemins relatifs..."
    sed -i.bak 's|href="/assets|href="./assets|g' dist/index.html
    sed -i.bak 's|src="/assets|src="./assets|g' dist/index.html
    rm -f dist/index.html.bak
    echo "[OK] Chemins convertis avec succès."
fi

echo
echo "==================================================="
echo "    PRÉPARATION DU DÉPLOIEMENT TERMINÉE"
echo "==================================================="
echo
echo "Votre projet est prêt à être déployé!"
echo
echo "Vous pouvez maintenant:"
echo " 1. Déployer sur Netlify en connectant votre dépôt GitHub"
echo " 2. Déployer via la CLI Netlify: netlify deploy"
echo " 3. Utiliser le drag-and-drop du dossier 'dist' sur l'interface Netlify"
echo
echo "Assurez-vous de configurer les variables d'environnement dans l'interface Netlify."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
