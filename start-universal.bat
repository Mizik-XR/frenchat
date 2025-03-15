
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Universel

REM Configuration de l'interface graphique
mode con cols=100 lines=30
color 1F

echo ===================================================
echo      DÉMARRAGE UNIVERSEL DE FILECHAT
echo ===================================================
echo.

REM Définir les variables d'environnement pour Supabase
set "VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co"
set "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk"
set "VITE_ALLOW_SIGNUP=true"

REM Détection du mode optimal
set "USE_OLLAMA=0"
set "USE_PYTHON=0"
set "USE_CLOUD=1"

REM Vérification d'Ollama (prioritaire)
netstat -an | findstr ":11434" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "USE_OLLAMA=1"
    echo [DÉTECTÉ] Ollama est actif sur ce système.
    echo           Le mode IA locale via Ollama sera disponible.
) else (
    echo [INFO] Ollama n'est pas en cours d'exécution.
    echo        L'IA locale via Ollama ne sera pas disponible.
)
echo.

REM Vérification de Python et Hugging Face
python --version >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python -c "import transformers" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "USE_PYTHON=1"
        echo [DÉTECTÉ] Python avec Hugging Face Transformers est disponible.
        echo           Le mode IA locale via Python sera disponible.
    ) else (
        echo [INFO] Python est installé mais la bibliothèque transformers n'est pas détectée.
        echo        L'IA locale via Python ne sera pas disponible.
    )
) else (
    echo [INFO] Python n'est pas détecté sur ce système.
    echo        L'IA locale via Python ne sera pas disponible.
)
echo.

REM Option pour forcer la reconstruction
set "FORCE_REBUILD=0"
if "%1"=="--rebuild" (
    set "FORCE_REBUILD=1"
    echo [INFO] Option de reconstruction forcée activée
)

REM Animation de chargement
echo Préparation de FileChat en cours...
for /L %%i in (1,1,20) do (
    <nul set /p =█
    timeout /t 0 /nobreak >nul
)
echo  OK!
echo.

REM Vérification du dossier dist
if not exist "dist\" (
    set "FORCE_REBUILD=1"
)

if "%FORCE_REBUILD%"=="1" (
    echo [INFO] Construction de l'application en cours...
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

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation du serveur web...
    call npm install -g http-server >nul 2>nul
    if errorlevel 1 (
        echo [ERREUR] Installation du serveur web échouée.
        echo         Utilisation de npx comme alternative...
        set "USE_NPX=1"
    )
)

REM Configuration des variables d'environnement
set "CLIENT_MODE=1"
set "FORCE_CLOUD_MODE=0"

if %USE_OLLAMA% EQU 0 if %USE_PYTHON% EQU 0 (
    set "FORCE_CLOUD_MODE=1"
    echo [INFO] Mode cloud forcé (aucune IA locale détectée).
)

REM Démarrage des services nécessaires
echo [INFO] Démarrage des services...

if %USE_PYTHON% EQU 1 (
    echo [INFO] Démarrage du serveur d'IA en Python...
    start "Serveur IA Python" /min cmd /c "python serve_model.py"
    timeout /t 2 /nobreak > nul
)

echo [INFO] Démarrage du serveur web...
if defined USE_NPX (
    start "Serveur Web FileChat" /min cmd /c "npx http-server dist -p 8080 -c-1 --cors"
) else (
    start "Serveur Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1 --cors"
)
timeout /t 2 /nobreak > nul

REM Construction de l'URL avec les paramètres appropriés
set "APP_URL=http://localhost:8080"

REM Ouvrir le navigateur
echo [INFO] Ouverture de FileChat dans votre navigateur...
start "" "!APP_URL!"

echo.
echo ===================================================
echo       FILECHAT EST PRÊT À ÊTRE UTILISÉ
echo ===================================================
echo.
echo L'application est maintenant accessible avec:

if %USE_OLLAMA% EQU 1 (
    echo [v] Mode IA locale via Ollama
)
if %USE_PYTHON% EQU 1 (
    echo [v] Mode IA locale via Python
)
echo [v] Mode cloud

echo.
echo URL d'accès: %APP_URL%
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas tant que
echo vous utilisez FileChat.
echo.
echo Pour quitter, fermez cette fenêtre.
echo ===================================================
echo.
pause >nul

echo.
echo Fermeture de FileChat...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Serveur Web FileChat" >nul 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Serveur IA Python" >nul 2>nul
exit /b 0
