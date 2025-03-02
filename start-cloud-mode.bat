@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Cloud

REM Configuration de l'interface graphique (meilleure présentation)
mode con cols=100 lines=30
color 1F

echo ===================================================
echo     DÉMARRAGE DE FILECHAT - MODE CLOUD
echo ===================================================
echo.
echo [INFO] Note: Les fonctionnalités Microsoft Teams sont
echo [INFO] temporairement désactivées dans cette version 
echo [INFO] de test (limites Supabase). Réactivation en Beta 1.1.
echo.

REM Configuration en mode cloud uniquement (masquer les fonctionnalités techniques)
set "MODE_CLOUD=1"
set "CLIENT_MODE=1"
set "HIDE_DEBUG=1"
set "VITE_DISABLE_DEV_MODE=1"
set "VITE_DEBUG_AUTH_KEY=disabled-%random%%random%"

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

REM Animation de chargement
echo [INFO] Initialisation de FileChat en cours...
for /L %%i in (1,1,20) do (
    <nul set /p =█
    timeout /t 0 /nobreak >nul
)
echo  OK!
echo.

REM Vérification des dépendances NPM
echo [INFO] Vérification des composants...
if not exist "node_modules\" (
    echo [INFO] Installation des composants nécessaires...
    call scripts\install-npm-deps.bat >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation des composants échouée.
        echo         Veuillez contacter le support technique.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Composants installés avec succès.
    echo.
)

REM Vérifier si http-server est installé
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

REM Démarrage de l'application web
echo [INFO] Lancement de l'application...
start "Application Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec le mode client activé et debug désactivé
echo [INFO] Ouverture dans votre navigateur...
start http://localhost:8080?client=true^&hideDebug=true

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
