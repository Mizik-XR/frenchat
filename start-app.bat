
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Vérification de l'environnement
echo ================================

REM Nettoyage des processus existants sur les ports
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application React" 2>nul

REM Vérification de Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js détecté: 
node --version
echo.

REM Nettoyage uniquement si nécessaire
if exist "node_modules\" (
    if not exist "node_modules\.cache" (
        echo Réinstallation complète des dépendances NPM requise
        rmdir /s /q node_modules
    ) else (
        echo Les node_modules semblent valides, pas de réinstallation nécessaire
        goto :skip_npm_install
    )
)

REM Installation des dépendances NPM avec cache
echo ================================
echo Installation des dépendances NPM
echo ================================
call npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund
if errorlevel 1 (
    echo Erreur lors de l'installation des dépendances NPM
    pause
    exit /b 1
)

:skip_npm_install

REM Installation de l'environnement Python en parallèle
start /B cmd /c "scripts\setup-venv.bat"

REM Démarrage de l'application React immédiatement
echo.
echo ================================
echo Démarrage des services
echo ================================

REM Démarrage du serveur IA dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

REM Démarrage immédiat de l'application React sur le port 8080
echo.
echo Démarrage de l'application...
start "Application React" cmd /c "set PORT=8080 && npm run dev"

echo.
echo ================================
echo Services en cours de démarrage
echo ================================
echo.
echo Services:
echo 1. Serveur IA local: http://localhost:8000
echo 2. Application React: http://localhost:8080
echo.
echo Pour arrêter les services, fermez les fenêtres de terminal ou pressez Ctrl+C
echo.
pause
