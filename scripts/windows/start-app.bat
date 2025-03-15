
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Cloud Uniquement

echo ===================================================
echo     DÉMARRAGE DE FILECHAT (MODE CLOUD)
echo ===================================================
echo.

REM Configuration du mode cloud uniquement
set FORCE_CLOUD_MODE=1
set CLIENT_MODE=1
set VITE_DISABLE_DEV_MODE=1

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

REM Vérification du contenu du fichier index.html
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
    echo [OK] http-server installé.
)

REM Définir l'URL avec les paramètres normalisés
set "APP_URL=http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

REM Démarrage du serveur web
echo [INFO] Lancement de l'application...
start "Serveur HTTP FileChat" /min cmd /c "http-server dist -p 8080 --cors -c-1"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [INFO] Ouverture dans votre navigateur...
start "" "%APP_URL%"

echo.
echo ===================================================
echo         FILECHAT DÉMARRÉ AVEC SUCCÈS
echo         (MODE CLOUD UNIQUEMENT)
echo ===================================================
echo.
echo L'application utilise l'IA en mode cloud uniquement.
echo Aucune installation Python n'est nécessaire.
echo.
echo URL d'accès: %APP_URL%
echo.
echo Pour la configuration OAuth Google, utilisez:
echo - Origine JavaScript autorisée: http://localhost:8080
echo - URI de redirection: http://localhost:8080/auth/google/callback?client=true^&hideDebug=true^&forceCloud=true^&mode=cloud
echo.
echo Pour arrêter les services, fermez cette fenêtre et les fenêtres associées.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul

REM Fermeture des processus
taskkill /F /FI "WINDOWTITLE eq Serveur HTTP FileChat" >nul 2>nul

exit /b 0
