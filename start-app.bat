
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Installation de l'application...
echo ================================

REM Installation des dépendances NPM sans demander
echo Installation des dépendances NPM...
call scripts\install-npm-deps.bat
if errorlevel 1 (
    echo Erreur lors de l'installation des dépendances NPM
    echo Veuillez vérifier votre connexion internet et réessayer
    pause
    exit /b 1
)

REM Installation de l'environnement Python et Rust
echo Installation de Python et Rust...
call scripts\install-python-env.bat
if errorlevel 1 (
    echo Erreur lors de l'installation de Python/Rust
    echo Assurez-vous d'avoir les droits administrateur
    pause
    exit /b 1
)

REM Configuration de l'environnement virtuel
echo Configuration de l'environnement Python...
call scripts\setup-venv.bat
if errorlevel 1 (
    echo Erreur lors de la configuration de l'environnement virtuel
    pause
    exit /b 1
)

REM Création du serveur modèle
echo Création du serveur IA...
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
