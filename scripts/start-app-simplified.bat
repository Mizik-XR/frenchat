
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Assistant de démarrage FileChat

REM Configuration de l'interface graphique (meilleure présentation)
mode con cols=100 lines=30
color 1F

echo ===================================================
echo            DÉMARRAGE DE FILECHAT
echo ===================================================
echo.

REM Activer le mode cloud par défaut - moins invasif
set "MODE_CLOUD=1"

REM Option pour forcer la reconstruction
set FORCE_REBUILD=0
if "%1"=="--rebuild" (
    set FORCE_REBUILD=1
    echo [INFO] Option de reconstruction forcée activée
)

REM Vérification du dossier dist
echo [INFO] Vérification des fichiers de l'application...
if not exist "dist\" (
    set FORCE_REBUILD=1
    echo [INFO] Le dossier 'dist' n'existe pas, reconstruction nécessaire.
)

if "%FORCE_REBUILD%"=="1" (
    echo [INFO] Construction de l'application en cours...
    rmdir /s /q dist 2>nul
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
    echo [ATTENTION] Le script Lovable manque dans index.html.
    echo [INFO] Exécution de fix-blank-page.bat pour corriger...
    call fix-blank-page.bat
    if errorlevel 1 (
        echo [ERREUR] Correction échouée.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Correction appliquée avec succès.
    echo.
)

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation de http-server échouée.
        echo         Veuillez contacter le support technique.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Animation de chargement
echo Initialisation de FileChat en cours...
for /L %%i in (1,1,20) do (
    <nul set /p =█
    timeout /t 0 /nobreak >nul
)
echo  OK!
echo.

REM Vérification rapide si Ollama est disponible
echo [INFO] Recherche d'Ollama sur votre système...
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama détecté! Le mode IA local sera disponible automatiquement.
) else (
    echo [INFO] Ollama n'est pas actif. Mode cloud activé par défaut.
)
echo.

REM Démarrage de l'application web
echo [INFO] Démarrage de l'interface web...
start "Application Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [INFO] Ouverture de FileChat dans votre navigateur...
start http://localhost:8080
echo.

echo ===================================================
echo      FILECHAT EST PRÊT À ÊTRE UTILISÉ
echo ===================================================
echo.
echo FileChat s'exécute maintenant dans votre navigateur.
echo.
echo Si vous souhaitez:
echo  - Utiliser l'IA locale: Configurez-la dans les paramètres de l'application
echo  - Utiliser l'IA cloud: Aucune configuration supplémentaire n'est nécessaire
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas tant que
echo vous utilisez FileChat.
echo.
echo REMARQUE: Avec PowerShell, utilisez toujours .\script.bat pour exécuter les scripts
echo.
echo ===================================================

REM Attendre que l'utilisateur ferme la fenêtre
pause >nul
echo.
echo Fermeture de FileChat...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat" >nul 2>nul
exit /b 0
