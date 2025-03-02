
@echo off
chcp 65001 >nul
title Lancement FileChat - Mode Ultra-Simple

echo ===================================================
echo     ASSISTANT DE DÉMARRAGE FILECHAT
echo     MODE ULTRA-SIMPLE
echo ===================================================
echo.
echo [1] Démarrage en cours...
echo.

REM Configuration en mode cloud uniquement
set "MODE_CLOUD=1"
set "CLIENT_MODE=1"
set "HIDE_DEBUG=1"

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation des composants...
    call npm install -g http-server >nul 2>nul
)

REM Vérification du dossier dist
if not exist "dist\" (
    echo [INFO] Préparation de l'application...
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Un problème est survenu.
        echo.
        echo Veuillez lancer "nettoyer-et-installer.bat"
        echo pour réinstaller l'application.
        echo.
        pause
        exit /b 1
    )
)

echo [INFO] Démarrage de l'application...
start "Application Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1"
timeout /t 2 /nobreak > nul

echo [INFO] Ouverture de FileChat...
start http://localhost:8080?client=true^&hideDebug=true

echo.
echo ===================================================
echo    FILECHAT EST PRÊT !
echo ===================================================
echo.
echo Cette fenêtre peut être minimisée.
echo Ne la fermez pas tant que vous utilisez FileChat.
echo.
echo Pour quitter, fermez cette fenêtre.
echo.
pause >nul

echo.
echo Fermeture de FileChat...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat" >nul 2>nul
exit /b 0
