
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Préparation pour Vercel

echo ===================================================
echo     PRÉPARATION FILECHAT POUR VERCEL
echo ===================================================
echo.

REM Configuration pour Vercel
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "VITE_CORS_PROXY=true"
set "NODE_OPTIONS=--max-old-space-size=4096"

REM Construction du projet
echo [INFO] Construction de l'application en cours...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Construction de l'application échouée
    pause
    exit /b 1
)

echo [OK] Application construite avec succès.
echo.
echo Vous pouvez maintenant déployer le dossier 'dist' sur Vercel.
echo Utilisez la commande : vercel --prod
echo.
echo ===================================================
pause
exit /b 0
