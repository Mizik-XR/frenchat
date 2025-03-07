
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Diagnostic Netlify

echo ===================================================
echo     DIAGNOSTIC DE DÉPLOIEMENT NETLIFY
echo ===================================================
echo.

REM Vérifier la présence des fichiers critiques
echo [ÉTAPE 1/4] Vérification des fichiers critiques...
if not exist "netlify.toml" (
    echo [ERREUR] Le fichier netlify.toml est manquant!
    pause
    exit /b 1
)

if not exist "_redirects" (
    echo [INFO] Création du fichier _redirects manquant...
    echo /* /index.html 200 > _redirects
    echo [OK] Fichier _redirects créé.
)

REM Vérifier les variables d'environnement
echo [ÉTAPE 2/4] Vérification des variables d'environnement...
echo [INFO] Variables importantes pour Netlify:
echo - SKIP_PYTHON_INSTALLATION
echo - NETLIFY_SKIP_PYTHON_REQUIREMENTS
echo - NO_RUST_INSTALL
echo - TRANSFORMERS_OFFLINE
echo - VITE_CLOUD_MODE
echo - VITE_ALLOW_LOCAL_AI
echo.

REM Nettoyer et reconstruire le projet
echo [ÉTAPE 3/4] Nettoyage et reconstruction...
if exist "dist" (
    rmdir /s /q dist
    echo [INFO] Dossier dist supprimé.
)

set "NO_RUST_INSTALL=1"
set "TRANSFORMERS_OFFLINE=1"
set "SKIP_PYTHON_INSTALLATION=true"
set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "NODE_OPTIONS=--max-old-space-size=4096"

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction a échoué.
    pause
    exit /b 1
)

echo [OK] Projet reconstruit avec succès.

REM Vérifier le fichier index.html pour le script Lovable
echo [ÉTAPE 4/4] Vérification des scripts...
if exist "dist\index.html" (
    findstr "gptengineer.js" "dist\index.html" >nul
    if !ERRORLEVEL! NEQ 0 (
        echo [ATTENTION] Le script gptengineer.js est manquant dans dist\index.html.
        echo [INFO] Copiez le contenu du fichier index.html original dans dist\index.html.
    ) else (
        echo [OK] Le script gptengineer.js est présent.
    )
) else (
    echo [ERREUR] Le fichier dist\index.html est manquant!
    pause
    exit /b 1
)

echo.
echo ===================================================
echo     DIAGNOSTIC TERMINÉ
echo ===================================================
echo.
echo Commandes pour déployer sur Netlify:
echo netlify deploy --prod --dir=dist
echo.
echo Ou utiliser l'interface graphique de Netlify.
echo N'oubliez pas de configurer les variables d'environnement dans l'interface Netlify!
echo.
pause
exit /b 0
