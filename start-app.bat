
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo      DÉMARRAGE DE FILECHAT
echo ================================
echo.

REM Vérification et nettoyage des processus existants
echo [INFO] Préparation de l'environnement...
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application React" 2>nul

REM Vérification et installation de Python
echo [INFO] Vérification de Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Python non détecté, démarrage de l'installation...
    call scripts\install-python-env.bat
    if errorlevel 1 (
        echo [ERREUR] Installation de Python échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
) else (
    echo [OK] Python détecté: 
    python --version
)
echo.

REM Vérification et création de l'environnement Python
echo [INFO] Vérification de l'environnement Python...
if not exist "venv\" (
    echo [INFO] Configuration de l'environnement Python...
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

REM Vérification des dépendances NPM
echo [INFO] Vérification des dépendances NPM...
if not exist "node_modules\" (
    echo [INFO] Installation des dépendances NPM...
    call scripts\install-npm-deps.bat
    if errorlevel 1 (
        echo [ERREUR] Installation des dépendances NPM échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Dépendances NPM installées avec succès
    echo.
)

REM Vérification du serveur modèle IA
echo [INFO] Vérification du serveur modèle IA...
if not exist "serve_model.py" (
    echo [INFO] Création du serveur modèle IA...
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

REM Configuration des origines autorisées pour CORS
set "ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,*"
echo [INFO] Origines CORS autorisées: %ALLOWED_ORIGINS%

REM Démarrage du serveur IA dans une nouvelle fenêtre
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

REM Démarrage de l'application web
echo [INFO] Démarrage de l'application web...
start "Application Web FileChat" cmd /c "http-server dist -p 8080"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [INFO] Ouverture du navigateur...
start http://localhost:8080

echo.
echo ================================
echo    FILECHAT DÉMARRÉ AVEC SUCCÈS
echo ================================
echo.
echo Services disponibles:
echo [1] Serveur IA local: http://localhost:8000
echo [2] Application Web: http://localhost:8080
echo.
echo [INFO] Pour arrêter les services, fermez cette fenêtre et les fenêtres associées
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
exit /b 0
