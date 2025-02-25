
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Vérification de l'environnement
echo ================================

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

REM Vérification de npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm n'est pas installé correctement
    pause
    exit /b 1
)

echo npm détecté:
npm --version
echo.

REM Vérification/Installation des dépendances NPM
echo ================================
echo Installation des dépendances NPM
echo ================================

call npm install
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

REM Création et activation de l'environnement virtuel
if not exist "venv\" (
    echo Création de l'environnement virtuel Python...
    python -m venv venv
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Erreur lors de l'activation de l'environnement virtuel
    pause
    exit /b 1
)

REM Installation des dépendances Python
pip install --upgrade pip
pip install --no-cache-dir setuptools wheel
pip install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir -r requirements.txt

echo.
echo ================================
echo Démarrage des services
echo ================================

REM Démarrage du serveur IA dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

REM Démarrage de l'application React
echo.
echo Démarrage de l'application...
start "Application React" cmd /c "npm run dev"

echo.
echo ================================
echo Configuration terminée!
echo ================================
echo.
echo Services démarrés:
echo 1. Serveur IA local: http://localhost:8000
echo 2. Application React: http://localhost:5173
echo.
echo Pour arrêter les services, fermez les fenêtres de terminal ou pressez Ctrl+C
echo.
pause
