
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Vérification des mises à jour...
echo ================================

REM Vérification des mises à jour NPM (optionnel)
set /p UPDATE_CHOICE=Voulez-vous vérifier et mettre à jour les dépendances NPM ? (O/N) 
if /i "%UPDATE_CHOICE%"=="O" (
    call scripts\install-npm-deps.bat
    if errorlevel 1 (
        echo Erreur lors de l'installation des dépendances NPM
        pause
        exit /b 1
    )
)

call scripts\install-python-env.bat
if errorlevel 1 (
    echo Erreur lors de l'installation de l'environnement Python/Rust
    pause
    exit /b 1
)

call scripts\setup-venv.bat
if errorlevel 1 (
    echo Erreur lors de la configuration de l'environnement virtuel
    pause
    exit /b 1
)

call scripts\create-model-server.bat
if errorlevel 1 (
    echo Erreur lors de la création du serveur modèle
    pause
    exit /b 1
)

echo.
echo ================================
echo Démarrage du serveur IA local...
echo ================================

REM Démarrage du serveur dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

echo.
echo Le serveur démarre... 
echo L'API sera disponible sur http://localhost:8000
echo Pour arrêter le serveur, fermez cette fenêtre ou la fenêtre du serveur.
echo.
echo Appuyez sur une touche pour quitter...
pause
