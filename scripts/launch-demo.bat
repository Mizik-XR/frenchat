
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Démo

echo ===================================================
echo     DÉMARRAGE DE LA DÉMO FILECHAT
echo ===================================================
echo.
echo Cette démo vous permettra de découvrir les fonctionnalités
echo de FileChat sans avoir besoin de configurer l'ensemble
echo de l'infrastructure.
echo.
echo ===================================================
echo.

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation de http-server échouée.
        echo         Veuillez exécuter manuellement: npm install -g http-server
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Vérification du dossier dist
echo [INFO] Vérification des fichiers...
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
)

REM Définir l'URL de démo
set DEMO_URL=http://localhost:8080/demo?client=true

REM Démarrage du serveur web
echo [INFO] Démarrage du serveur web...
start "Serveur Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec l'URL de la démo
echo [INFO] Lancement de la démo dans votre navigateur...
start "" "%DEMO_URL%"

echo.
echo ===================================================
echo      LA DÉMO FILECHAT EST PRÊTE !
echo ===================================================
echo.
echo La démo s'exécute maintenant dans votre navigateur.
echo URL d'accès: %DEMO_URL%
echo.
echo Cette fenêtre peut être fermée une fois que vous avez
echo terminé d'explorer la démo.
echo.
echo ===================================================
echo.
pause
exit /b 0
