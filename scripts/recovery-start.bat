
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Récupération

echo ===================================================
echo     FILECHAT - MODE RÉCUPÉRATION
echo ===================================================
echo.
echo Ce script démarre FileChat avec des optimisations
echo pour résoudre les problèmes d'initialisation React.
echo.

REM Nettoyage des caches
echo [1/5] Nettoyage des caches...
del /s /q "node_modules\.vite\*" > nul 2>&1
rmdir /s /q "node_modules\.vite" > nul 2>&1

REM Configuration des variables d'environnement
echo [2/5] Configuration des variables...
set "VITE_FORCE_OPTIMIZE=true"
set "VITE_DISABLE_OPTIMIZEDEPS=false"
set "VITE_DEBUG_REACT=true"
set "VITE_FORCE_VENDOR_CHUNK=true"

REM Construction optimisée
echo [3/5] Construction optimisée...
call npm run build -- --force --debug-react

if errorlevel 1 (
    echo.
    echo [ERREUR] La construction a échoué. Tentative en mode minimal...
    echo.
    call npx vite build --config scripts/minimal-vite.config.js
    
    if errorlevel 1 (
        echo.
        echo [ERREUR CRITIQUE] La construction minimale a également échoué.
        echo Consultez les messages d'erreur ci-dessus.
        echo.
        pause
        exit /b 1
    )
)

echo [4/5] Démarrage du serveur web...
start "FileChat Server" cmd /c "npx serve dist -p 8080 --no-clipboard"

echo [5/5] Ouverture dans le navigateur...
timeout /t 2 /nobreak > nul
start "" "http://localhost:8080/?recovery=true&forceCloud=true"

echo.
echo ===================================================
echo     FILECHAT DÉMARRÉ EN MODE RÉCUPÉRATION
echo ===================================================
echo.
echo L'application est maintenant accessible à l'adresse:
echo http://localhost:8080/?recovery=true^&forceCloud=true
echo.
echo Si vous rencontrez toujours des problèmes:
echo 1. Exécutez "node scripts/detect-dependency-cycles.js"
echo 2. Vérifiez si des dépendances circulaires sont détectées
echo 3. Consultez les erreurs dans la console du navigateur
echo.
echo Cette fenêtre peut être minimisée mais ne la fermez pas
echo tant que vous utilisez l'application.
echo.
echo Pour quitter, fermez cette fenêtre.
echo ===================================================

pause > nul
