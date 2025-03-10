
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Déploiement vers Netlify

echo ===================================================
echo     DÉPLOIEMENT FILECHAT VERS NETLIFY
echo ===================================================
echo.
echo Ce script va déployer FileChat vers Netlify.
echo Assurez-vous d'avoir installé la CLI Netlify et
echo d'être connecté à votre compte Netlify.
echo.
echo Étapes:
echo 1. Vérification de l'environnement
echo 2. Préparation du build pour déploiement
echo 3. Déploiement vers Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si netlify CLI est installé
where netlify >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Netlify CLI n'est pas configuré, installation en cours...
    call npm install -g netlify-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation de la CLI Netlify a échoué.
        echo.
        echo Pour l'installer manuellement, exécutez:
        echo npm install -g netlify-cli
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] CLI Netlify installée avec succès.
)

REM Configuration de l'environnement pour Netlify
set "NO_RUST_INSTALL=1"
set "NETLIFY_SKIP_PYTHON=true"
set "TRANSFORMERS_OFFLINE=1"
set "NODE_ENV=production"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "SKIP_PYTHON_INSTALLATION=true"
set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
set "NODE_OPTIONS=--max-old-space-size=4096"

REM Nettoyer les fichiers inutiles
echo [INFO] Nettoyage des fichiers temporaires...
if exist "dist\" rmdir /s /q dist

REM Installation optimisée pour Netlify
echo [INFO] Installation des dépendances avec configuration pour Netlify...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] L'installation des dépendances a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Vérifier la configuration Netlify
echo [ÉTAPE 1/3] Vérification de la configuration Netlify...
node scripts\ensure-netlify-build.js
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Des problèmes ont été détectés avec la configuration Netlify.
    echo [INFO] Continuons malgré tout, le script tentera d'appliquer des corrections.
    echo.
    echo Appuyez sur une touche pour continuer ou CTRL+C pour annuler...
    pause >nul
)

REM Préparer le build
echo [ÉTAPE 2/3] Préparation du build pour déploiement...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction du projet a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Build prêt pour déploiement.
echo.

REM Vérifier et corriger les chemins absolus
call scripts\verify-netlify-deployment.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La vérification du déploiement a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Vérification et correction des chemins terminées.

REM Vérifier manuellement les fichiers critiques
echo [INFO] Vérification manuelle des fichiers critiques...
if not exist "dist\diagnostic.html" (
    echo [ATTENTION] diagnostic.html manquant, copie manuelle...
    copy "public\diagnostic.html" "dist\"
)
if not exist "dist\image-diagnostic.html" (
    echo [ATTENTION] image-diagnostic.html manquant, copie manuelle...
    copy "public\image-diagnostic.html" "dist\"
)
if not exist "dist\assets\custom-placeholder.svg" (
    echo [ATTENTION] custom-placeholder.svg manquant, copie manuelle...
    if not exist "dist\assets" mkdir "dist\assets"
    copy "src\assets\custom-placeholder.svg" "dist\assets\"
)
if not exist "dist\filechat-animation.gif" (
    echo [ATTENTION] filechat-animation.gif manquant, copie manuelle...
    copy "public\filechat-animation.gif" "dist\"
)

REM Vérifier la connexion à Netlify
echo [ÉTAPE 3/3] Vérification de la connexion à Netlify...
netlify status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Vous n'êtes pas connecté à Netlify.
    echo [INFO] Connexion à Netlify...
    netlify login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de la connexion à Netlify.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connecté à Netlify.
echo.

REM Déployer vers Netlify
echo [INFO] Voulez-vous:
echo 1. Déployer une prévisualisation (preview)
echo 2. Déployer en production
choice /C 12 /N /M "Choisissez une option (1 ou 2): "

if %ERRORLEVEL% EQU 1 (
    echo [INFO] Déploiement d'une prévisualisation...
    netlify deploy --dir=dist
) else (
    echo [INFO] Déploiement en production...
    netlify deploy --prod --dir=dist
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Le déploiement a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Déploiement terminé avec succès.
echo.

echo [SÉCURITÉ] IMPORTANT: Configuration des variables d'environnement
echo ===================================================
echo.
echo N'oubliez pas de configurer les variables d'environnement
echo dans l'interface Netlify pour protéger vos clés API.
echo.
echo Variables à configurer:
echo - VITE_SUPABASE_URL: URL de votre projet Supabase
echo - VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase
echo - VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)
echo.
echo Méthode sécurisée:
echo 1. Accédez à votre projet dans l'interface Netlify
echo 2. Allez dans "Site settings" -^> "Environment variables"
echo 3. Ajoutez les variables ci-dessus sans les stocker dans le code
echo.
echo ===================================================
echo.
echo Vous pouvez maintenant partager le lien de déploiement avec le client.
echo.
pause
exit /b 0
