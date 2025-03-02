
@echo off
chcp 65001 >nul
title Lancement FileChat - Serveur Local + Interface Web

echo ===================================================
echo     DÉMARRAGE SERVEUR LOCAL ET INTERFACE WEB
echo ===================================================
echo.
echo Cette commande va démarrer:
echo 1. Le serveur IA local (Python)
echo 2. L'interface web FileChat
echo.
echo Votre GPU CUDA sera utilisé si disponible.
echo.

REM Vérification de Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Python 3.9+ et relancer ce script
    pause
    exit /b 1
)

REM Vérification de CUDA/GPU
echo [INFO] Vérification de votre configuration GPU...
python -c "import torch; print(f'GPU disponible: {torch.cuda.is_available()}'); print(f'Nombre de GPUs: {torch.cuda.device_count()}'); print(f'Modèle GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"Aucun\"}')" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python -c "import torch; print(f'GPU disponible: {torch.cuda.is_available()}'); print(f'Nombre de GPUs: {torch.cuda.device_count()}'); print(f'Modèle GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"Aucun\"}')"
) else (
    echo [INFO] PyTorch n'est pas installé, installation en cours...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] Installation de PyTorch avec CUDA échouée, utilisation du mode CPU
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    )
)

REM Vérification de l'environnement virtuel
if not exist "venv\" (
    echo [INFO] Création de l'environnement virtuel Python...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [INFO] Installation des dépendances Python...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] Installation complète échouée, passage au mode allégé
        set NO_RUST_INSTALL=1
        call scripts\setup-venv.bat
    )
) else (
    call venv\Scripts\activate.bat
)

REM Démarrage du serveur IA local en arrière-plan
echo [INFO] Démarrage du serveur IA local...
start "Serveur IA Local" /min cmd /c "call venv\Scripts\activate.bat && python serve_model.py"

REM Attente pour laisser le serveur démarrer
echo [INFO] Attente du démarrage du serveur IA (5 secondes)...
timeout /t 5 /nobreak >nul

REM Configuration de l'application en mode hybride (local + cloud)
set "MODE_HYBRID=1"

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation des composants web...
    call npm install -g http-server >nul 2>nul
)

REM Vérification du dossier dist
if not exist "dist\" (
    echo [INFO] Préparation de l'application web...
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Un problème est survenu lors de la construction.
        pause
        exit /b 1
    )
)

echo [INFO] Démarrage de l'interface web...
start "Interface Web FileChat" /min cmd /c "http-server dist -p 8080 -c-1"
timeout /t 2 /nobreak > nul

echo [INFO] Ouverture de FileChat en mode hybride...
start http://localhost:8080?hybrid=true

echo.
echo ===================================================
echo    FILECHAT EST PRÊT !
echo ===================================================
echo.
echo Serveur local: http://localhost:8000
echo Interface web: http://localhost:8080
echo.
echo Cette fenêtre peut être minimisée.
echo Ne la fermez pas tant que vous utilisez FileChat.
echo.
echo Pour quitter complètement, fermez cette fenêtre.
echo.
pause >nul

echo.
echo Fermeture de tous les services...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Interface Web FileChat" >nul 2>nul
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" >nul 2>nul
exit /b 0
