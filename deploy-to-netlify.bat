
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
echo 2. Vérification de Rust/Cargo
echo 3. Préparation du build pour déploiement
echo 4. Déploiement vers Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si netlify CLI est installé
if not exist "%USERPROFILE%\.netlify" (
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

REM Vérifier si Rust/Cargo est installé
echo [ÉTAPE 1/4] Vérification de Rust/Cargo...
where rustc >nul 2>nul
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Rust/Cargo n'est pas installé ou n'est pas dans le PATH.
    echo [INFO] Installation de Rust en cours...
    
    REM Télécharger le programme d'installation de Rust
    curl -O https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
    
    REM Exécuter l'installateur avec les options par défaut
    rustup-init.exe -y
    
    REM Mettre à jour le PATH pour cette session
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    
    REM Vérifier l'installation
    where rustc >nul 2>nul
    where cargo >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] L'installation automatique de Rust a échoué.
        echo             Vous pouvez continuer en mode sans Rust.
        echo             Définissez NO_RUST_INSTALL=1 pour l'installation Python.
        set NO_RUST_INSTALL=1
    ) else (
        echo [OK] Rust et Cargo installés avec succès:
        rustc --version
        cargo --version
    )
) else (
    echo [OK] Rust et Cargo sont déjà installés:
    rustc --version
    cargo --version
)
echo.

REM Préparer le build
echo [ÉTAPE 2/4] Préparation du build pour déploiement...
call scripts\prepare-deployment.bat
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
echo [ÉTAPE 3/4] Vérification de la connexion à Netlify...
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
echo [ÉTAPE 4/4] Déploiement vers Netlify...
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
