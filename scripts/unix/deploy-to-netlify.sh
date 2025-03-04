
#!/bin/bash

echo "==================================================="
echo "    DÉPLOIEMENT FRENCHAT VERS NETLIFY"
echo "==================================================="
echo
echo "Ce script va déployer Frenchat vers Netlify."
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
echo "[ÉTAPE 1/3] Vérification de l'environnement..."
if ! command -v netlify &> /dev/null; then
    echo "[INFO] La CLI Netlify n'est pas installée, installation en cours..."
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo "[ERREUR] L'installation de la CLI Netlify a échoué."
        echo
        echo "Tentative avec npx..."
        USE_NPX=1
    else
        echo "[OK] CLI Netlify installée avec succès."
        USE_NPX=0
    fi
else
    echo "[OK] CLI Netlify est déjà installée."
    USE_NPX=0
fi

# Vérifier si le dossier dist existe déjà
echo "[INFO] Vérification du dossier dist..."
if [ ! -d "dist" ]; then
    echo "[ATTENTION] Le dossier dist n'existe pas. Il sera créé lors de la construction."
else
    echo "[OK] Le dossier dist existe."
    
    # Vérifier si le dossier contient des fichiers
    if [ -z "$(ls -A dist 2>/dev/null)" ]; then
        echo "[ATTENTION] Le dossier dist est vide. Un nouveau build sera effectué."
    else
        echo "[OK] Le dossier dist contient des fichiers."
    fi
fi

# Préparer le build
echo "[ÉTAPE 2/3] Préparation du build pour déploiement..."
echo "[INFO] Nettoyage des fichiers temporaires..."
if [ -d "dist" ]; then
    # On garde une sauvegarde du dist au cas où
    if [ ! -d "dist_backup" ]; then
        mkdir -p dist_backup 2>/dev/null
    fi
    cp -r dist/* dist_backup/ 2>/dev/null
    echo "[OK] Sauvegarde du dossier dist créée dans dist_backup."
fi

echo "[INFO] Configuration de l'environnement de build..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NO_RUST_INSTALL=1

echo "[INFO] Construction du projet en cours..."
echo "[INFO] Cette étape peut prendre plusieurs minutes..."

# Vérifier si package.json existe
if [ ! -f "package.json" ]; then
    echo "[ERREUR] Fichier package.json introuvable."
    echo
    echo "Vérifiez que vous êtes dans le bon répertoire."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Vérifier le script de build dans package.json
if ! grep -q "\"build\":" "package.json"; then
    echo "[ERREUR] Script de build non trouvé dans package.json."
    echo
    echo "Vérifiez que votre package.json contient une commande de build."
    echo
    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
    exit 1
fi

# Tenter la construction avec npm run build
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] La construction avec npm run build a échoué."
    echo
    echo "Tentative avec npx vite build..."
    npx vite build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] La construction du projet a échoué."
        echo
        echo "Options de récupération:"
        echo "1. Restaurer la sauvegarde du dossier dist"
        echo "2. Tenter une construction avec des options simplifiées"
        echo "3. Quitter"
        read -p "Choisissez une option (1, 2 ou 3): " choice
        
        case $choice in
            1)
                echo "[INFO] Restauration de la sauvegarde du dossier dist..."
                if [ -d "dist_backup" ] && [ "$(ls -A dist_backup 2>/dev/null)" ]; then
                    rm -rf dist 2>/dev/null
                    mkdir -p dist 2>/dev/null
                    cp -r dist_backup/* dist/ 2>/dev/null
                    echo "[OK] Sauvegarde restaurée."
                else
                    echo "[ERREUR] Aucune sauvegarde disponible."
                    echo
                    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                    exit 1
                fi
                ;;
            2)
                echo "[INFO] Tentative de construction avec options simplifiées..."
                export NODE_OPTIONS="--max-old-space-size=4096"
                export NO_RUST_INSTALL=1
                export VITE_DISABLE_DEV_MODE=1
                npx vite build --force
                if [ $? -ne 0 ]; then
                    echo "[ERREUR] La construction a échoué même avec les options simplifiées."
                    echo
                    read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                    exit 1
                fi
                ;;
            *)
                echo
                read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                exit 1
                ;;
        esac
    fi
fi

# Vérifier le contenu du dossier dist après la construction
echo "[INFO] Vérification du contenu du dossier dist..."
if [ ! -f "dist/index.html" ]; then
    echo "[ERREUR] Le fichier dist/index.html est manquant."
    echo "         La construction n'a pas produit un dossier dist valide."
    echo
    echo "Options de récupération:"
    echo "1. Restaurer la sauvegarde du dossier dist"
    echo "2. Utiliser fix-blank-page.sh pour tenter une réparation"
    echo "3. Quitter"
    read -p "Choisissez une option (1, 2 ou 3): " choice
    
    case $choice in
        1)
            echo "[INFO] Restauration de la sauvegarde du dossier dist..."
            if [ -d "dist_backup" ] && [ "$(ls -A dist_backup 2>/dev/null)" ]; then
                rm -rf dist 2>/dev/null
                mkdir -p dist 2>/dev/null
                cp -r dist_backup/* dist/ 2>/dev/null
                echo "[OK] Sauvegarde restaurée."
            else
                echo "[ERREUR] Aucune sauvegarde disponible."
                echo
                read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                exit 1
            fi
            ;;
        2)
            echo "[INFO] Tentative de réparation avec fix-blank-page.sh..."
            if [ -f "scripts/unix/fix-blank-page.sh" ]; then
                bash scripts/unix/fix-blank-page.sh
            else
                echo "[ERREUR] Script de réparation non trouvé."
                echo
                read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                exit 1
            fi
            if [ $? -ne 0 ]; then
                echo "[ERREUR] La réparation a échoué."
                echo
                read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                exit 1
            fi
            ;;
        *)
            echo
            read -p "Appuyez sur Entrée pour quitter..." -n1 -s
            exit 1
            ;;
    esac
fi

# Vérifier que le script Lovable est bien présent
echo "[INFO] Vérification du script Lovable..."
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Le script Lovable manque dans index.html, correction en cours..."
    if [ -f "scripts/unix/fix-blank-page.sh" ]; then
        bash scripts/unix/fix-blank-page.sh >/dev/null 2>&1
    else
        # Correction manuelle si le script n'existe pas
        sed -i.bak 's|</body>|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>\n</body>|g' dist/index.html
        rm -f dist/index.html.bak
    fi
    echo "[OK] Correction appliquée."
fi

# Vérification des chemins relatifs dans index.html
if grep -q "href=\"/assets" "dist/index.html" || grep -q "src=\"/assets" "dist/index.html"; then
    echo "[ATTENTION] Chemins absolus détectés dans index.html, conversion en chemins relatifs..."
    sed -i.bak 's|href="/assets|href="./assets|g' dist/index.html
    sed -i.bak 's|src="/assets|src="./assets|g' dist/index.html
    rm -f dist/index.html.bak
    echo "[OK] Chemins convertis avec succès."
fi

echo "[OK] Build prêt pour déploiement."
echo

# Vérifier la connexion à Netlify
echo "[ÉTAPE 3/3] Préparation du déploiement vers Netlify..."
if [ "$USE_NPX" = "1" ]; then
    echo "[INFO] Utilisation de npx pour la CLI Netlify..."
    npx netlify status >/dev/null 2>&1
else
    netlify status >/dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    echo "[INFO] Vous n'êtes pas connecté à Netlify."
    echo "[INFO] Connexion à Netlify..."
    if [ "$USE_NPX" = "1" ]; then
        npx netlify login
    else
        netlify login
    fi
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Échec de la connexion à Netlify."
        echo
        echo "Alternatives:"
        echo "1. Déployer manuellement le dossier 'dist' via l'interface Netlify"
        echo "2. Connecter votre dépôt GitHub à Netlify"
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
fi
echo "[OK] Connecté à Netlify."
echo

# Déployer vers Netlify
echo "[INFO] Configuration du déploiement..."
echo
echo "[INFO] Options de déploiement:"
echo "1. Déployer une prévisualisation (preview)"
echo "2. Déployer en production"
echo "3. Annuler le déploiement"
read -p "Choisissez une option (1, 2 ou 3): " choice

case $choice in
    3)
        echo
        echo "Déploiement annulé par l'utilisateur."
        echo
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 0
        ;;
    2)
        echo "[INFO] Déploiement en production..."
        DEPLOY_TYPE="production"
        ;;
    *)
        echo "[INFO] Déploiement d'une prévisualisation..."
        DEPLOY_TYPE="preview"
        ;;
esac

# Exécution du déploiement
echo "[INFO] Déploiement en cours... (Ne fermez pas cette fenêtre)"
echo "[INFO] Cette étape peut prendre plusieurs minutes..."

if [ "$DEPLOY_TYPE" = "production" ]; then
    if [ "$USE_NPX" = "1" ]; then
        npx netlify deploy --prod --dir=dist
    else
        netlify deploy --prod --dir=dist
    fi
else
    if [ "$USE_NPX" = "1" ]; then
        npx netlify deploy --dir=dist
    else
        netlify deploy --dir=dist
    fi
fi

if [ $? -ne 0 ]; then
    echo "[ERREUR] Le déploiement a échoué."
    echo
    echo "Options:"
    echo "1. Réessayer le déploiement (parfois les problèmes sont temporaires)"
    echo "2. Déployer manuellement via l'interface Netlify (glisser-déposer le dossier dist)"
    echo "3. Quitter"
    read -p "Choisissez une option (1, 2 ou 3): " choice
    
    case $choice in
        1)
            echo "[INFO] Nouvelle tentative de déploiement..."
            if [ "$DEPLOY_TYPE" = "production" ]; then
                if [ "$USE_NPX" = "1" ]; then
                    npx netlify deploy --prod --dir=dist
                else
                    netlify deploy --prod --dir=dist
                fi
            else
                if [ "$USE_NPX" = "1" ]; then
                    npx netlify deploy --dir=dist
                else
                    netlify deploy --dir=dist
                fi
            fi
            
            if [ $? -ne 0 ]; then
                echo "[ERREUR] Le déploiement a échoué à nouveau."
                echo
                read -p "Appuyez sur Entrée pour quitter..." -n1 -s
                exit 1
            fi
            ;;
        2)
            echo
            echo "[INFO] Pour déployer manuellement:"
            echo "1. Ouvrez https://app.netlify.com dans votre navigateur"
            echo "2. Connectez-vous à votre compte"
            echo "3. Glissez-déposez le dossier 'dist' dans l'interface"
            echo
            read -p "Appuyez sur Entrée pour quitter..." -n1 -s
            exit 0
            ;;
        *)
            echo
            read -p "Appuyez sur Entrée pour quitter..." -n1 -s
            exit 1
            ;;
    esac
fi
echo "[OK] Déploiement terminé avec succès."
echo

echo "==================================================="
echo "     DÉPLOIEMENT TERMINÉ"
echo "==================================================="
echo
echo "Le site a été déployé avec succès sur Netlify!"
echo
echo "N'oubliez pas de configurer les variables d'environnement"
echo "dans l'interface Netlify pour les fonctionnalités avancées."
echo
echo "Variables à configurer:"
echo "- VITE_SUPABASE_URL: URL de votre projet Supabase"
echo "- VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase"
echo "- VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)"
echo
echo "Pour accéder à ces paramètres:"
echo "1. Ouvrez le site déployé sur Netlify"
echo "2. Allez dans Site settings -> Build & deploy -> Environment"
echo
echo "==================================================="
echo
echo "Vous pouvez maintenant partager le lien de déploiement!"
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0
