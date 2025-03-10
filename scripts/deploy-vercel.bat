
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Déploiement Vercel

echo ===================================================
echo     DÉPLOIEMENT AUTOMATIQUE VERS VERCEL
echo ===================================================
echo.
echo Ce script va déployer FileChat sur Vercel sans
echo nécessiter de pull manuel du code.
echo.
echo Étapes :
echo 1. Vérification de l'environnement
echo 2. Préparation du build pour déploiement
echo 3. Configuration des MIME types
echo 4. Connexion à Vercel
echo 5. Déploiement sur Vercel
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si Vercel CLI est installé
where vercel >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Vercel CLI n'est pas configuré, installation en cours...
    call npm install -g vercel
    
    REM Vérifier si l'installation a réussi
    where vercel >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [ATTENTION] L'installation automatique a échoué, tentative avec --force...
        call npm install -g vercel --force
        
        REM Vérifier à nouveau
        where vercel >nul 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [ERREUR] L'installation de Vercel CLI a échoué.
            echo.
            echo Essayez manuellement avec :
            echo npm install -g vercel
            echo ou
            echo yarn global add vercel
            echo.
            
            echo Voulez-vous continuer avec npx vercel ? (O/N)
            choice /C ON /N /M "Choix : "
            if !ERRORLEVEL! NEQ 1 (
                echo Déploiement annulé.
                exit /b 1
            )
            set "VERCEL_CMD=npx vercel"
        ) else (
            echo [OK] Vercel CLI installé avec succès (méthode alternative).
            set "VERCEL_CMD=vercel"
        )
    ) else (
        echo [OK] Vercel CLI installé avec succès.
        set "VERCEL_CMD=vercel"
    )
) else (
    echo [OK] Vercel CLI est déjà installé.
    set "VERCEL_CMD=vercel"
)

REM Exécuter le script de préparation au déploiement
echo [ÉTAPE 1/5] Préparation au déploiement...
call scripts\prepare-deployment.bat
if !ERRORLEVEL! NEQ 0 (
    echo [ERREUR] La préparation au déploiement a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Préparation au déploiement terminée.
echo.

REM Vérifier la connexion à Vercel
echo [ÉTAPE 3/5] Vérification de la connexion à Vercel...
%VERCEL_CMD% whoami >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Vous n'êtes pas connecté à Vercel.
    echo [INFO] Connexion à Vercel...
    %VERCEL_CMD% login
    if !ERRORLEVEL! NEQ 0 (
        echo [ERREUR] Échec de la connexion à Vercel.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connecté à Vercel.
echo.

REM Configuration pour webhook (optionnel)
echo [ÉTAPE 4/5] Voulez-vous configurer un webhook pour vérifier le déploiement ? (O/N)
choice /C ON /N /M "Choix : "
if !ERRORLEVEL! EQU 1 (
    echo [INFO] Configuration du webhook de vérification...
    node scripts\vercel-webhook.js
    echo.
)

REM Déployer sur Vercel
echo [ÉTAPE 5/5] Souhaitez-vous :
echo 1. Déployer une prévisualisation
echo 2. Déployer en production
choice /C 12 /N /M "Choisissez une option (1 ou 2) : "

if !ERRORLEVEL! EQU 1 (
    echo [INFO] Déploiement d'une prévisualisation...
    %VERCEL_CMD%
) else (
    echo [INFO] Déploiement en production...
    %VERCEL_CMD% --prod
)

if !ERRORLEVEL! NEQ 0 (
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
echo Variables à configurer :
echo - VITE_SUPABASE_URL : URL de votre projet Supabase
echo - VITE_SUPABASE_ANON_KEY : Clé anonyme Supabase
echo - VITE_CLOUD_API_URL : URL de l'API cloud (optionnel)
echo.
echo ===================================================
echo.
echo Vous pouvez maintenant partager le lien de déploiement avec votre client.
echo.
pause
exit /b 0
