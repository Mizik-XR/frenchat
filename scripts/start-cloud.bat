
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Cloud

echo ===================================================
echo     DÉMARRAGE DE FILECHAT (MODE CLOUD)
echo ===================================================
echo.

REM Configuration du mode cloud
set "FORCE_CLOUD_MODE=1"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "VITE_CORS_PROXY=true"

REM Vérification du dossier dist
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

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
    if errorlevel 1 (
        echo [ERREUR] Installation de http-server échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Vérifier la présence du script Lovable dans index.html
type "dist\index.html" | findstr "gptengineer.js" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Script Lovable non trouvé dans dist\index.html, application de correctifs...
    copy /y index.html dist\index.html >nul
    echo [OK] Correctifs appliqués.
    echo.
)

REM Démarrage du serveur web avec CORS activé
echo [INFO] Lancement de l'application...
start "Serveur HTTP FileChat" /min cmd /c "http-server dist -p 8080 --cors -c-1"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec les paramètres qui forcent le mode cloud
echo [INFO] Ouverture dans votre navigateur...
start "" "http://localhost:8080/?forceCloud=true&mode=cloud"

echo.
echo ===================================================
echo     FILECHAT DÉMARRÉ AVEC SUCCÈS (MODE CLOUD)
echo ===================================================
echo.
echo Pour arrêter l'application, fermez cette fenêtre.
echo.
pause >nul

REM Fermeture des processus
taskkill /F /FI "WINDOWTITLE eq Serveur HTTP FileChat" >nul 2>nul

exit /b 0
