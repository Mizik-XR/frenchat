
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Démarrage de FileChat
echo ================================
echo.

REM Nettoyage des processus existants sur les ports
echo [INFO] Nettoyage des processus existants...
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application React" 2>nul

REM Vérification de Python
echo [INFO] Vérification de Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installé. Veuillez l'installer depuis https://python.org/
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

echo [OK] Python détecté: 
python --version
echo.

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
echo Démarrage du serveur IA local
echo ================================
echo.

REM Récupération de l'adresse IP locale pour améliorer la compatibilité réseau
for /f "tokens=4" %%i in ('route print ^| find " 0.0.0.0"') do set LOCAL_IP=%%i
echo [INFO] Adresse IP locale détectée: %LOCAL_IP%

REM Configuration des origines autorisées pour CORS
set "ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,*"
echo [INFO] Origines CORS autorisées: %ALLOWED_ORIGINS%

REM Démarrage du serveur IA dans une nouvelle fenêtre avec les variables d'environnement configurées
echo [INFO] Démarrage du serveur IA local...
start "Serveur IA Local" cmd /c "set ALLOWED_ORIGINS=%ALLOWED_ORIGINS% && venv\Scripts\python.exe serve_model.py"
if errorlevel 1 (
    echo [ERREUR] Démarrage du serveur IA échoué
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Attendre un peu que le serveur IA démarre
timeout /t 3 /nobreak > nul

echo.
echo ================================
echo Service IA démarré avec succès
echo ================================
echo.
echo Service disponible:
echo [1] Serveur IA local: http://localhost:8000
echo.
echo [INFO] Le serveur IA local est prêt à être utilisé avec l'application web déployée
echo [INFO] Utilisez le service en vous connectant sur l'application web FileChat
echo.
echo Pour arrêter le service, fermez cette fenêtre ou pressez Ctrl+C
echo.
echo Logs du serveur:
echo ---------------
echo.

REM Maintenir la fenêtre ouverte pour voir les logs
timeout /t 9999 /nobreak > nul
