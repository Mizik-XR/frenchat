
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode de Secours

REM Configuration de l'interface graphique (meilleure présentation)
mode con cols=100 lines=30
color 1F

echo ===================================================
echo     DÉMARRAGE DE FILECHAT - MODE DE SECOURS
echo ===================================================
echo.

REM Configuration en mode minimal pour assurer le fonctionnement
set "FORCE_CLOUD_MODE=1"
set "CLIENT_MODE=1"
set "VITE_DISABLE_DEV_MODE=1"
set "FALLBACK_MODE=1"
set "DISABLE_ADVANCED_FEATURES=1"

REM Vérification du dossier dist
echo [INFO] Vérification des fichiers de l'application...
if not exist "dist\" (
    echo [ERREUR] Le dossier 'dist' n'existe pas.
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

REM Vérification du fichier index.html dans dist
if not exist "dist\index.html" (
    echo [ERREUR] Le fichier 'dist\index.html' est manquant.
    echo [INFO] Reconstruction de l'application en cours...
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

REM Démarrage d'un serveur HTTP simple
echo [INFO] Démarrage du serveur web en mode minimal...
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation du serveur web...
    call npm install -g http-server >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation du serveur web échouée.
        echo         Essai avec npx...
        echo.
    )
)

REM Lancement avec npx en cas d'échec de l'installation globale
start "Application Web FileChat - Mode de Secours" /min cmd /c "http-server dist -p 8080 -c-1 --cors || npx http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec des paramètres de secours
echo [INFO] Ouverture dans votre navigateur...
start http://localhost:8080?mode=fallback^&client=true^&hideDebug=true^&forceCloud=true

echo.
echo ===================================================
echo    FILECHAT EST PRÊT À ÊTRE UTILISÉ
echo          MODE DE SECOURS ACTIVÉ
echo ===================================================
echo.
echo L'application démarre en mode minimal avec
echo des fonctionnalités réduites pour assurer un
echo chargement fiable.
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
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat - Mode de Secours" >nul 2>nul
exit /b 0
