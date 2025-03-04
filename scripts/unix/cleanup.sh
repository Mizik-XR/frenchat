
#!/bin/bash

echo "==================================================="
echo "     NETTOYAGE COMPLET DE L'ENVIRONNEMENT FRENCHAT"
echo "==================================================="
echo ""
echo "Ce script va nettoyer votre environnement de développement"
echo "en supprimant les fichiers temporaires et inutiles."
echo ""
echo "Actions qui seront effectuées:"
echo "1. Suppression des fichiers temporaires et de cache"
echo "2. Nettoyage des backups inutiles"
echo "3. Optimisation du dossier node_modules"
echo "4. Vérification et nettoyage du dossier dist"
echo ""
echo "==================================================="
echo ""
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo ""

# Suppression des fichiers temporaires
echo "[ÉTAPE 1/4] Suppression des fichiers temporaires..."

echo "[INFO] Recherche des fichiers .log..."
find . -name "*.log" -type f -print -delete

echo "[INFO] Recherche des fichiers temporaires..."
find . -name "*.tmp" -type f -print -delete

echo "[INFO] Recherche des fichiers exécutables non nécessaires..."
# Trouver les executables mais exclure ceux dans les dossiers système
find . -type f -executable -not -path "*/node_modules/*" -not -path "*/venv/*" -not -name "*.sh" -not -name "*.py" -print -delete

echo "[INFO] Suppression des caches npm..."
if [ -d ".npm" ]; then
    echo "   Suppression du dossier .npm"
    rm -rf .npm 2>/dev/null
fi

echo "[INFO] Suppression du cache de build..."
if [ -d ".cache" ]; then
    echo "   Suppression du dossier .cache"
    rm -rf .cache 2>/dev/null
fi

if [ -d "node_modules/.cache" ]; then
    echo "   Suppression du cache dans node_modules"
    rm -rf node_modules/.cache 2>/dev/null
fi

echo "[OK] Fichiers temporaires supprimés."
echo ""

# Nettoyage des backups
echo "[ÉTAPE 2/4] Nettoyage des backups..."

echo "[INFO] Recherche des fichiers .bak..."
find . -name "*.bak" -type f -print -delete

echo "[INFO] Vérification des dossiers *_backup..."
if [ -d "dist_backup" ]; then
    echo "   Trouvé dist_backup"
    
    read -p "Souhaitez-vous conserver le backup du dist? (O/N) " choice
    if [[ "${choice,,}" == "n" ]]; then
        echo "   Suppression du dossier dist_backup"
        rm -rf dist_backup 2>/dev/null
    else
        echo "   Conservation du backup dist_backup"
    fi
fi

echo "[OK] Backups nettoyés."
echo ""

# Optimisation node_modules
echo "[ÉTAPE 3/4] Optimisation de node_modules..."

echo "[INFO] Vérification de la taille de node_modules..."
if [ -d "node_modules" ]; then
    echo "   Trouvé dossier node_modules"
    
    read -p "Souhaitez-vous nettoyer les dépendances et réinstaller? (O/N) " choice
    if [[ "${choice,,}" == "o" ]]; then
        echo "   Nettoyage du dossier node_modules en cours..."
        rm -rf node_modules 2>/dev/null
        
        echo "   Nettoyage du cache npm..."
        npm cache clean --force
        
        echo "   Réinstallation des dépendances..."
        npm ci
        if [ $? -ne 0 ]; then
            echo "   Échec de npm ci, essai avec npm install..."
            npm install
        fi
        echo "   [OK] Dépendances réinstallées avec succès."
    else
        echo "   Conservation du dossier node_modules"
    fi
else
    echo "   node_modules non trouvé, aucune action nécessaire."
fi

echo "[OK] Optimisation node_modules terminée."
echo ""

# Vérification du dossier dist
echo "[ÉTAPE 4/4] Vérification du dossier dist..."

if [ -d "dist" ]; then
    echo "   Trouvé dossier dist"
    
    echo "   Vérification de la structure du dossier dist..."
    if [ ! -f "dist/index.html" ]; then
        echo "   [ATTENTION] Le fichier dist/index.html est manquant."
        echo "   Il semble que le build soit incomplet ou corrompu."
        
        read -p "Souhaitez-vous supprimer et reconstruire le dossier dist? (O/N) " choice
        if [[ "${choice,,}" == "o" ]]; then
            echo "   Suppression du dossier dist..."
            rm -rf dist 2>/dev/null
            
            echo "   Reconstruction du projet..."
            export NODE_OPTIONS=--max-old-space-size=4096
            npm run build
            
            if [ -f "dist/index.html" ]; then
                echo "   [OK] Dossier dist reconstruit avec succès."
            else
                echo "   [ERREUR] Échec de la reconstruction du dist."
                echo "   Veuillez exécuter scripts/unix/fix-blank-page.sh pour résoudre ce problème."
            fi
        fi
    else
        echo "   Vérification de la présence du script Lovable..."
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "   [ATTENTION] Le script Lovable manque dans index.html"
            echo "   Correction en cours..."
            bash scripts/unix/fix-edit-issues.sh >/dev/null 2>&1 
            echo "   [OK] Correction appliquée."
        else
            echo "   [OK] Le script Lovable est correctement intégré."
        fi
        
        # Vérification des chemins relatifs dans index.html
        if grep -q "href=\"/assets" "dist/index.html" || grep -q "src=\"/assets" "dist/index.html"; then
            echo "   [ATTENTION] Chemins absolus détectés dans index.html, conversion en chemins relatifs..."
            sed -i.bak 's|href="/assets|href="./assets|g' dist/index.html
            sed -i.bak 's|src="/assets|src="./assets|g' dist/index.html
            rm -f dist/index.html.bak
            echo "   [OK] Chemins convertis avec succès."
        fi
        
        echo "   [OK] Structure du dossier dist correcte."
    fi
else
    echo "   Le dossier dist n'existe pas encore. Aucune action nécessaire."
    echo "   Vous pouvez créer le dossier dist en exécutant 'npm run build'."
fi

echo "[OK] Vérification du dossier dist terminée."
echo ""

echo "==================================================="
echo "     NETTOYAGE TERMINÉ AVEC SUCCÈS"
echo "==================================================="
echo ""
echo "Votre environnement est maintenant propre et optimisé!"
echo ""
echo "Recommandations:"
echo "1. Lancez 'npm run dev' pour développer localement"
echo "2. Utilisez 'bash scripts/unix/deploy-to-netlify.sh' pour déployer sur Netlify"
echo ""
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0
