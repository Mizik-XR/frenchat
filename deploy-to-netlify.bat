
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
echo 1. Préparation du build pour déploiement
echo 2. Configuration des variables d'environnement Netlify
echo 3. Déploiement vers Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si netlify CLI est installé
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La CLI Netlify n'est pas installée.
    echo.
    echo Pour l'installer, exécutez:
    echo npm install -g netlify-cli
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Préparer le build
echo [ÉTAPE 1/3] Préparation du build pour déploiement...
call scripts\prepare-deployment.bat >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La préparation du déploiement a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Build prêt pour déploiement.
echo.

REM Vérifier la connexion à Netlify
echo [ÉTAPE 2/3] Vérification de la connexion à Netlify...
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

REM Configuration des variables d'environnement
echo [INFO] Configuration des variables d'environnement...
set /p SUPABASE_URL="Entrez l'URL Supabase (https://dbdueopvtlanxgumenpu.supabase.co): "
if "!SUPABASE_URL!"=="" set SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co

set /p SUPABASE_KEY="Entrez la clé anonyme Supabase: "
if "!SUPABASE_KEY!"=="" (
    echo [ERREUR] La clé Supabase est requise.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Déployer vers Netlify
echo [ÉTAPE 3/3] Déploiement vers Netlify...
netlify deploy --prod --dir=dist --env.VITE_SUPABASE_URL=!SUPABASE_URL! --env.VITE_SUPABASE_ANON_KEY=!SUPABASE_KEY!
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
echo N'oubliez pas de vérifier les variables d'environnement
echo dans l'interface Netlify pour les fonctionnalités avancées.
echo.
echo Pour continuer à configurer votre site, allez sur le tableau de bord Netlify.
echo.
echo ===================================================
pause
exit /b 0
