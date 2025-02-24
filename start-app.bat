
@echo off
chcp 65001
echo ================================
echo Installation et lancement de l'application
echo ================================

REM Vérification de Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit
)

REM Installation des dépendances si node_modules n'existe pas
if not exist "node_modules\" (
    echo Installation des dépendances...
    call npm install
)

REM Vérification des modifications Git et mise à jour des dépendances si nécessaire
git fetch
git status | findstr "behind" > nul
if %ERRORLEVEL% EQU 0 (
    echo Des mises à jour sont disponibles. Application des mises à jour...
    git pull
    echo Mises à jour appliquées avec succès.
    echo Mise à jour des dépendances...
    call npm install
)

echo Lancement du serveur de développement...
start http://localhost:8080

REM Lancement en mode développement avec surveillance des fichiers
call npm run dev -- --host

pause
