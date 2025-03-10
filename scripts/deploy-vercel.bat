
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Déploiement vers Vercel

echo ===================================================
echo     DÉPLOIEMENT FILECHAT VERS VERCEL
echo ===================================================
echo.
echo Ce script va déployer FileChat vers Vercel.
echo Assurez-vous d'avoir installé la CLI Vercel et
echo d'être connecté à votre compte Vercel.
echo.
echo Étapes:
echo 1. Vérification de l'environnement
echo 2. Préparation du build pour déploiement
echo 3. Déploiement vers Vercel
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si vercel CLI est installé
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Vercel CLI n'est pas configuré, installation en cours...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation de la CLI Vercel a échoué.
        echo.
        echo Pour l'installer manuellement, exécutez:
        echo npm install -g vercel
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] CLI Vercel installée avec succès.
)

REM Configuration pour le déploiement
set "NODE_ENV=production"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "SKIP_PYTHON_INSTALLATION=true"

REM Nettoyer les fichiers inutiles
echo [INFO] Nettoyage des fichiers temporaires...
if exist "dist\" rmdir /s /q dist

REM Installation optimisée pour Vercel
echo [INFO] Installation des dépendances avec configuration pour Vercel...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

REM Préparer le build
echo [ÉTAPE 2/3] Préparation du build pour déploiement...
set "NODE_OPTIONS=--max-old-space-size=4096"
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

REM Vérifier la connexion à Vercel
echo [ÉTAPE 3/3] Vérification de la connexion à Vercel...
vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Vous n'êtes pas connecté à Vercel.
    echo [INFO] Connexion à Vercel...
    vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de la connexion à Vercel.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connecté à Vercel.
echo.

REM Déployer vers Vercel
echo [INFO] Voulez-vous:
echo 1. Déployer une prévisualisation
echo 2. Déployer en production
choice /C 12 /N /M "Choisissez une option (1 ou 2): "

if %ERRORLEVEL% EQU 1 (
    echo [INFO] Déploiement d'une prévisualisation...
    vercel
) else (
    echo [INFO] Déploiement en production...
    vercel --prod
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
echo dans l'interface Vercel pour les fonctionnalités avancées.
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
