
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

REM Nettoyage du cache npm
call npm cache clean --force
echo Cache npm nettoyé
echo.

REM Suppression des modules node existants
if exist "node_modules\" (
    echo Suppression des node_modules existants...
    rmdir /s /q node_modules
)

REM Installation des dépendances NPM
echo ================================
echo Installation des dépendances NPM
echo ================================

call npm install --legacy-peer-deps
if errorlevel 1 (
    echo Erreur lors de l'installation des dépendances NPM
    pause
    exit /b 1
)

REM Installation de l'environnement Python
echo ================================
echo Configuration Python
echo ================================

REM Vérification de Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé. 
    echo Téléchargement de Python...
    curl -o python-installer.exe https://www.python.org/ftp/python/3.9.7/python-3.9.7-amd64.exe
    echo Installation de Python...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    del python-installer.exe
)

echo Python détecté:
python --version
echo.

REM Suppression de l'environnement virtuel existant s'il existe
if exist "venv\" (
    echo Suppression de l'ancien environnement virtuel...
    rmdir /s /q venv
)

REM Création et activation de l'environnement virtuel
echo Création d'un nouvel environnement virtuel Python...
python -m venv venv
if errorlevel 1 (
    echo Erreur lors de la création de l'environnement virtuel
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Erreur lors de l'activation de l'environnement virtuel
    pause
    exit /b 1
)

REM Installation des dépendances Python
echo Installation des dépendances Python...
python -m pip install --upgrade pip
pip install --no-cache-dir setuptools wheel
pip install --no-cache-dir -r requirements.txt

REM Installation spécifique de PyTorch CPU
pip install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu

echo.
echo ================================
echo Démarrage des services
echo ================================

REM Démarrage du serveur IA dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

REM Attente pour laisser le temps au serveur de démarrer
timeout /t 5 /nobreak

REM Démarrage de l'application React sur le port 8080
echo.
echo Démarrage de l'application...
start "Application React" cmd /c "set PORT=8080 && npm run dev"

echo.
echo ================================
echo Configuration terminée!
echo ================================
echo.
echo Services démarrés:
echo 1. Serveur IA local: http://localhost:8000
echo 2. Application React: http://localhost:8080
echo.
echo Pour arrêter les services, fermez les fenêtres de terminal ou pressez Ctrl+C
echo.
pause
