
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Frenchat - Démarrage Universel

echo ===================================================
echo            DÉMARRAGE UNIVERSEL DE FRENCHAT
echo ===================================================
echo.

rem Vérification de la présence du script Lovable
echo [INFO] Vérification de la configuration Lovable...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Script Lovable manquant, correction en cours...
        call fix-edit-issues.bat
    ) else (
        echo [OK] Configuration Lovable correcte.
    )
) else (
    echo [ATTENTION] index.html introuvable, vérification avancée nécessaire.
    if exist "scripts\fix-blank-page.bat" (
        call scripts\fix-blank-page.bat
    ) else (
        echo [ERREUR] Impossible de trouver les scripts de réparation.
        exit /b 1
    )
)

rem Vérification de la compatibilité React
echo [INFO] Vérification de la compatibilité React...
if exist "node_modules\react\package.json" (
    findstr "\"version\": \"18" "node_modules\react\package.json" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Version de React incompatible détectée, correction en cours...
        call npm uninstall react react-dom
        call npm cache clean --force
        call npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
        echo [OK] React réinstallé avec la version compatible.
    ) else (
        echo [OK] Version de React compatible.
    )
) else (
    echo [ATTENTION] Installation React manquante ou incomplète.
    echo [INFO] Installation des dépendances React...
    call npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0
)

rem Vérification des commandes requises
echo [INFO] Vérification des commandes requises...
where npx >nul 2>nul
if !errorlevel! NEQ 0 (
    echo [ATTENTION] npx n'est pas disponible. Vérification de npm...
    where npm >nul 2>nul
    if !errorlevel! NEQ 0 (
        echo [ERREUR] npm n'est pas disponible. Veuillez installer Node.js.
        echo Téléchargez-le depuis https://nodejs.org/
        pause
        exit /b 1
    )
    echo [INFO] Installation de npx via npm...
    call npm install -g npx
)

rem Vérification du fichier _redirects
echo [INFO] Vérification du fichier _redirects...
if not exist "public\_redirects" (
    echo [INFO] Création du fichier _redirects...
    if not exist "public" mkdir public
    echo /* /index.html 200 > "public\_redirects"
    echo [OK] Fichier _redirects créé.
)

rem Reconstruction forcée pour s'assurer que tout est à jour
echo [INFO] Reconstruction du projet pour appliquer les modifications...
call npm run build
if errorlevel 1 (
    echo [ATTENTION] La reconstruction avec npm run build a échoué, tentative avec npx...
    call npx vite build
    if errorlevel 1 (
        echo [ATTENTION] La reconstruction a échoué, tentative avec des options simplifiées...
        set NO_RUST_INSTALL=1
        set NODE_OPTIONS=--max-old-space-size=4096
        call npx vite build --force
    )
)

rem Choix du mode de démarrage
echo.
echo Choisissez le mode de démarrage :
echo 1. Mode développement (npm run dev)
echo 2. Mode production locale (start-app.bat)
echo 3. Mode cloud uniquement (start-cloud-mode.bat)
echo.
set /p choice="Votre choix [1-3] (1 par défaut): "

if "%choice%"=="2" (
    echo [INFO] Démarrage en mode production locale...
    call start-app.bat
) else if "%choice%"=="3" (
    echo [INFO] Démarrage en mode cloud uniquement...
    call start-cloud-mode.bat
) else (
    echo [INFO] Démarrage en mode développement...
    set VITE_FORCE_REACT_VERSION=18.2.0
    call npx vite
    if errorlevel 1 (
        echo [ATTENTION] Démarrage avec npx vite échoué, tentative avec npm run dev...
        call npm run dev
    )
)

exit /b 0
