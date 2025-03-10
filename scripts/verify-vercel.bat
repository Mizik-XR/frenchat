
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo     VÉRIFICATION DU DÉPLOIEMENT VERCEL
echo ===================================================
echo.

REM Vérifier si l'environnement est correct
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH.
    echo         Téléchargez-le depuis https://nodejs.org/
    exit /b 1
)

REM Vérifier si axios est installé
call node -e "require('axios')" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Le module axios est requis mais n'est pas installé.
    echo        Installation en cours...
    call npm install --save-dev axios
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible d'installer axios. Exécutez 'npm install --save-dev axios' manuellement.
        exit /b 1
    )
)

REM Demander l'URL à vérifier si non fournie
set "SITE_URL=%1"
if "%SITE_URL%"=="" (
    echo Entrez l'URL du site à vérifier 
    echo [Appuyez sur ENTRÉE pour utiliser la valeur par défaut : https://filechat-app.vercel.app]
    set /p "SITE_URL="
    if "!SITE_URL!"=="" set "SITE_URL=https://filechat-app.vercel.app"
)

REM Exécuter la vérification
echo.
echo Vérification de !SITE_URL!...
echo.
call node scripts\verify-deployment.js "!SITE_URL!"

echo.
echo ===================================================
echo.
echo Pour déployer à nouveau avec les corrections nécessaires, 
echo exécutez : scripts\deploy-vercel.bat
echo.
pause
exit /b 0
