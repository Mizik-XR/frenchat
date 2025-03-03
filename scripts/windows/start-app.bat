
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Démarrage Application

echo ===================================================
echo     DÉMARRAGE DE FILECHAT
echo ===================================================
echo.

REM Vérification des prérequis
echo [ÉTAPE 1/3] Vérification des prérequis...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé. Téléchargez-le sur https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
    echo   [OK] Node.js %NODE_VERSION% est installé.
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installé. Téléchargez-le sur https://www.python.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('python --version') do set PYTHON_VERSION=%%a
    echo   [OK] %PYTHON_VERSION% est installé.
)
echo.

REM Démarrage du backend (API)
echo [ÉTAPE 2/3] Démarrage du serveur IA...
if not exist "serve_model.py" (
    echo [ERREUR] Le fichier serve_model.py est introuvable.
    pause
    exit /b 1
)

start "Serveur IA FileChat" /min cmd /c "venv\Scripts\python serve_model.py"
echo   [OK] Serveur IA démarré.
echo.

REM Démarrage du frontend
echo [ÉTAPE 3/3] Démarrage du frontend...
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [INFO] Installation de http-server...
    call npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation de http-server.
        pause
        exit /b 1
    )
    echo   [OK] http-server installé.
) else (
    echo   [OK] http-server est déjà installé.
)

start "Serveur HTTP FileChat" /min cmd /c "http-server dist -p 8080 --cors -c-1"
echo   [OK] Serveur HTTP démarré.
echo.

REM Ouverture du navigateur
timeout /t 2 /nobreak > nul
start "" "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

echo.
echo ===================================================
echo         FILECHAT DÉMARRÉ AVEC SUCCÈS
echo ===================================================
echo.
echo Services disponibles:
echo [1] Serveur IA local: http://localhost:8000
echo [2] Application Web: http://localhost:8080/?client=true^&hideDebug=true^&forceCloud=true^&mode=cloud
echo.
echo Pour arrêter les services, fermez cette fenêtre et les fenêtres associées.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul

REM Fermeture des processus
taskkill /F /FI "WINDOWTITLE eq Serveur IA FileChat" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Serveur HTTP FileChat" >nul 2>nul

exit /b 0
