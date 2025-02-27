
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Démarrage de DocuChatter
echo ================================
echo.

REM Nettoyage des processus existants sur les ports
echo [INFO] Nettoyage des processus existants...
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application React" 2>nul

REM Vérification de Node.js
echo [INFO] Vérification de Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo [OK] Node.js détecté: 
node --version
echo.

REM Vérification des modules node
echo [INFO] Vérification des modules NPM...
if not exist "node_modules\" (
    echo [INFO] Installation des dépendances NPM nécessaire
    goto :npm_install
) else (
    if not exist "node_modules\.cache" (
        echo [INFO] Réinstallation complète des dépendances NPM requise
        rmdir /s /q node_modules
        goto :npm_install
    ) else (
        echo [OK] Les node_modules semblent valides
        goto :skip_npm_install
    )
)

:npm_install
echo ================================
echo Installation des dépendances NPM
echo ================================
echo.
call npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund
if errorlevel 1 (
    echo [ERREUR] Installation des dépendances NPM échouée
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Dépendances NPM installées avec succès
echo.

:skip_npm_install

REM Vérification et création de l'environnement Python si nécessaire
echo [INFO] Vérification de l'environnement Python...
if not exist "venv\" (
    echo ================================
    echo Configuration environnement Python
    echo ================================
    echo.
    call scripts\setup-venv.bat
    if errorlevel 1 (
        echo [ERREUR] Configuration de l'environnement Python échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Environnement Python configuré avec succès
    echo.
)

REM Vérification du modèle IA
echo [INFO] Vérification du serveur modèle IA...
if not exist "serve_model.py" (
    echo ================================
    echo Création du serveur modèle IA
    echo ================================
    echo.
    call scripts\create-model-server.bat
    if errorlevel 1 (
        echo [ERREUR] Création du serveur modèle IA échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Serveur modèle IA créé avec succès
    echo.
)

REM Démarrage des services
echo ================================
echo Démarrage des services
echo ================================
echo.

REM Démarrage du serveur IA dans une nouvelle fenêtre
echo [INFO] Démarrage du serveur IA local...
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"
if errorlevel 1 (
    echo [ERREUR] Démarrage du serveur IA échoué
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Démarrage immédiat de l'application React sur le port 5173
echo [INFO] Démarrage de l'application React...
start "Application React" cmd /c "npm run dev -- --host --port 5173"
if errorlevel 1 (
    echo [ERREUR] Démarrage de l'application React échoué
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo.
echo ================================
echo Services démarrés avec succès
echo ================================
echo.
echo Services disponibles:
echo [1] Serveur IA local: http://localhost:8000
echo [2] Application React: http://localhost:5173
echo.
echo [INFO] Attendez quelques secondes que les serveurs démarrent complètement...
timeout /t 10 /nobreak > nul
echo [INFO] Ouverture automatique du navigateur...
start http://localhost:5173
echo.
echo Pour arrêter les services, fermez les fenêtres de terminal ou pressez Ctrl+C
echo Pour fermer cette fenêtre, appuyez sur une touche...
pause >nul
