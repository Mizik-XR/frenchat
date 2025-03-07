
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Préparation du déploiement

echo ===================================================
echo    PRÉPARATION DU DÉPLOIEMENT FILECHAT
echo ===================================================
echo.
echo Cette procédure va préparer le projet pour déploiement:
echo  1. Vérification des fichiers de configuration
echo  2. Optimisation du build
echo  3. Tests de pré-déploiement
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Nettoyer les fichiers inutiles
echo [ÉTAPE 1/4] Nettoyage des fichiers temporaires...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Configuration pour le déploiement sans Rust
set "NO_RUST_INSTALL=1"
set "TRANSFORMERS_OFFLINE=1"
set "NODE_ENV=production"
set "SKIP_PYTHON_INSTALLATION=true"

REM Vérifier et préparer les fichiers de configuration
echo [ÉTAPE 2/4] Vérification des fichiers de configuration...
if not exist "netlify.toml" (
    echo [ERREUR] Le fichier netlify.toml est manquant.
    echo         Exécutez le script de génération de configuration.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Optimisation du build
echo [ÉTAPE 3/4] Optimisation et build du projet...
set "NODE_OPTIONS=--max-old-space-size=4096"

REM Installation optimisée pour le déploiement
echo [INFO] Installation des dépendances avec configuration optimisée...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction du projet a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Projet construit avec succès.
echo.

REM Vérification post-build
echo [ÉTAPE 4/4] Vérification des fichiers de déploiement...
if not exist "dist\index.html" (
    echo [ERREUR] Le fichier dist\index.html est manquant.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo.
echo ===================================================
echo    PRÉPARATION DU DÉPLOIEMENT TERMINÉE
echo ===================================================
echo.
echo Votre projet est prêt à être déployé!
echo.
echo Vous pouvez maintenant:
echo  1. Déployer sur Netlify en connectant votre dépôt GitHub
echo  2. Déployer via la CLI Netlify: netlify deploy
echo  3. Utiliser le drag-and-drop du dossier 'dist' sur l'interface Netlify
echo.
echo Assurez-vous de configurer les variables d'environnement dans l'interface Netlify:
echo  - VITE_SUPABASE_URL
echo  - VITE_SUPABASE_ANON_KEY
echo  - VITE_CLOUD_API_URL (optionnel)
echo.
echo [IMPORTANT] Pour le déploiement Netlify, NO_RUST_INSTALL=1 est activé par défaut
echo            dans le fichier netlify.toml pour éviter les problèmes de compilation.
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
exit /b 0
