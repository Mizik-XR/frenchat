
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Cloud (Local)

REM Configuration de l'interface graphique (meilleure présentation)
mode con cols=100 lines=30
color 1F

echo ===================================================
echo     DÉMARRAGE DE FILECHAT - MODE SIMPLIFIÉ
echo ===================================================
echo.

REM Configuration en mode cloud uniquement
set "FORCE_CLOUD_MODE=1"
set "CLIENT_MODE=1"
set "VITE_DISABLE_DEV_MODE=1"

REM Vérification et installation de http-server si nécessaire
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation du serveur web...
    call npm install -g http-server >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation du serveur web échouée.
        echo         Veuillez contacter le support technique.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Construire l'application
if not exist "dist\" (
    echo [INFO] Construction de l'application en cours...
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Construction de l'application échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Application construite avec succès.
    echo.
)

REM Vérification que le fichier contient le script nécessaire pour Lovable
findstr "gptengineer.js" "dist\index.html" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html, reconstruction...
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Construction de l'application échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Application reconstruite avec succès.
    echo.
)

REM Démarrage du serveur web
echo [INFO] Lancement de l'application...
start "Application Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec le mode client activé, debug désactivé et cloud forcé
echo [INFO] Ouverture dans votre navigateur...
start http://localhost:8080?client=true^&hideDebug=true^&forceCloud=true

echo.
echo ===================================================
echo    FILECHAT EST PRÊT À ÊTRE UTILISÉ
echo          MODE CLOUD UNIQUEMENT
echo ===================================================
echo.
echo L'application utilise l'IA en mode cloud uniquement.
echo Aucune installation locale n'est nécessaire.
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas tant que
echo vous utilisez FileChat.
echo.
echo Pour quitter, fermez cette fenêtre.
echo ===================================================
echo.
pause >nul

echo.
echo Fermeture de FileChat...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat" >nul 2>nul
exit /b 0
