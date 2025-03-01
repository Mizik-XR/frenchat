
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

REM Configuration en mode cloud uniquement
set "MODE_CLOUD=1"

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
start "Application Web FileChat" /min cmd /c "http-server dist -p 8080"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [INFO] Ouverture dans votre navigateur...
start http://localhost:8080

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
