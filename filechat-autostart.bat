
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Démarrage Automatisé

echo ===================================================
echo     DÉMARRAGE AUTOMATISÉ DE FILECHAT
echo ===================================================
echo.

REM Étape 1 : Vérification des prérequis
echo [ÉTAPE 1/5] Vérification des prérequis...

REM Vérification de Node.js
echo   [INFO] Vérification de Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé. Téléchargez-le sur https://nodejs.org/
    echo.
    echo Installation interrompue.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
    echo   [OK] Node.js %NODE_VERSION% est installé.
)

REM Vérification de Python
echo   [INFO] Vérification de Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installé. Téléchargez-le sur https://www.python.org/
    echo.
    echo Installation interrompue.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('python --version') do set PYTHON_VERSION=%%a
    echo   [OK] %PYTHON_VERSION% est installé.
)
echo.

REM Étape 2 : Configuration de l'environnement
echo [ÉTAPE 2/5] Configuration de l'environnement...

REM Configuration du fichier .env.local (au lieu de .env pour ne pas confondre avec les .env.development)
if not exist ".env.local" (
    echo   [INFO] Création du fichier .env.local...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_ENVIRONMENT=development
        echo VITE_SITE_URL=http://localhost:8080
        echo VITE_LOVABLE_VERSION=dev
        echo FORCE_CLOUD_MODE=true
    ) > .env.local
    echo   [OK] Fichier .env.local créé avec succès.
) else (
    echo   [OK] Fichier .env.local détecté.
    
    REM Vérifier si FORCE_CLOUD_MODE est présent, sinon l'ajouter
    findstr /i "FORCE_CLOUD_MODE" .env.local >nul
    if %ERRORLEVEL% NEQ 0 (
        echo FORCE_CLOUD_MODE=true >> .env.local
        echo   [INFO] Mode cloud forcé ajouté à .env.local
    )
)

REM Étape 3 : Nettoyage et reconstruction
echo [ÉTAPE 3/5] Nettoyage et reconstruction...

REM Nettoyage des fichiers de cache
echo   [INFO] Nettoyage des caches...
if exist ".vite\" (
    rd /s /q .vite
    echo   [OK] Cache Vite supprimé.
)

REM Suppression du dossier dist s'il existe
if exist "dist\" (
    echo   [INFO] Suppression du dossier dist...
    rd /s /q dist
    echo   [OK] Dossier dist supprimé.
)

REM Installation des dépendances Node.js
echo   [INFO] Installation des dépendances NPM...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de npm install. Vérifiez votre connexion ou le fichier package.json.
    echo.
    echo Installation interrompue.
    pause
    exit /b 1
)
echo   [OK] Dépendances installées.

REM Configuration du mode cloud explicite dans l'environnement
set NODE_OPTIONS=--max-old-space-size=4096
set VITE_FORCE_CLOUD=true
set APP_CONFIG_FORCE_CLOUD=true

REM Construction du frontend avec plus de mémoire
echo   [INFO] Construction de l'application...
echo   [INFO] Utilisation de 4GB de mémoire pour la compilation...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la construction. Vérifiez les erreurs dans la console.
    echo.
    echo Construction interrompue.
    pause
    exit /b 1
)
echo   [OK] Application construite avec succès.

REM Vérification du contenu du fichier index.html
findstr "gptengineer.js" "dist\index.html" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html, correction...
    
    (for /f "delims=" %%i in (dist\index.html) do (
        echo %%i | findstr "<script type=\"module\" crossorigin" >nul
        if !errorlevel! EQU 0 (
            echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        )
        echo %%i
    )) > dist\index.html.temp
    
    move /y dist\index.html.temp dist\index.html >nul
    echo   [OK] Script Lovable ajouté.
) else (
    echo   [OK] Script Lovable déjà présent.
)
echo.

REM Étape 4 : Lancement du backend
echo [ÉTAPE 4/5] Lancement du backend...

REM Vérification du fichier serve_model.py
if not exist "serve_model.py" (
    echo [ERREUR] serve_model.py introuvable.
    echo.
    echo Lancement interrompu.
    pause
    exit /b 1
)

REM Création de l'environnement Python si nécessaire
if not exist "venv\" (
    echo   [INFO] Création de l'environnement Python...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de la création de l'environnement Python.
        echo.
        echo Lancement interrompu.
        pause
        exit /b 1
    )
    
    call venv\Scripts\activate
    echo   [INFO] Installation des dépendances Python...
    pip install fastapi uvicorn pydantic
    echo   [OK] Dépendances Python installées.
) else (
    echo   [OK] Environnement Python détecté.
)

REM Lancement du backend dans une nouvelle fenêtre
echo   [INFO] Démarrage du serveur IA...
start "Serveur IA FileChat" /min cmd /c "venv\Scripts\python serve_model.py"
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec du démarrage du serveur IA.
    echo.
    echo Lancement interrompu.
    pause
    exit /b 1
)
echo   [OK] Serveur IA démarré.
echo.

REM Étape 5 : Lancement du frontend
echo [ÉTAPE 5/5] Lancement du frontend...

REM Vérification de http-server
echo   [INFO] Vérification de http-server...
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [INFO] Installation de http-server...
    call npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation de http-server.
        echo.
        echo Lancement interrompu.
        pause
        exit /b 1
    )
    echo   [OK] http-server installé.
) else (
    echo   [OK] http-server est installé.
)

REM Lancement du frontend dans une nouvelle fenêtre
echo   [INFO] Démarrage du serveur HTTP...
start "Serveur HTTP FileChat" /min cmd /c "http-server dist -p 8080 --cors -c-1"
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec du démarrage du serveur HTTP.
    echo.
    echo Lancement interrompu.
    pause
    exit /b 1
)
echo   [OK] Serveur HTTP démarré.
echo.

REM Pause pour s'assurer que les services sont démarrés
timeout /t 3 /nobreak > nul

REM Ouverture du navigateur avec les paramètres optimaux
echo   [INFO] Ouverture du navigateur...
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

REM Fermeture des processus au besoin
taskkill /F /FI "WINDOWTITLE eq Serveur IA FileChat" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Serveur HTTP FileChat" >nul 2>nul

exit /b 0
