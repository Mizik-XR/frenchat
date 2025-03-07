
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
if exist "node_modules\" rmdir /s /q node_modules

REM Installation optimisée pour Netlify
echo [INFO] Installation des dépendances avec configuration pour Netlify...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

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

echo ===================================================
echo     DÉPLOIEMENT TERMINÉ
echo ===================================================
echo.
echo N'oubliez pas de configurer les variables d'environnement
echo dans l'interface Netlify pour les fonctionnalités avancées.
echo.
echo Variables à configurer:
echo - VITE_SUPABASE_URL: URL de votre projet Supabase
echo - VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase
echo - VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)
echo.
echo ===================================================
echo.
echo Vous pouvez maintenant partager le lien de déploiement avec le client.
echo.
pause
exit /b 0
