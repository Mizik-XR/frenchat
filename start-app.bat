
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

REM Vérification des modifications Git
git fetch
git status | findstr "behind" > nul
if %ERRORLEVEL% EQU 0 (
    echo Des mises à jour sont disponibles. Application des mises à jour...
    git pull
    echo Mises à jour appliquées avec succès.
)

REM Installation des dépendances si node_modules n'existe pas ou si package.json a été modifié
if not exist "node_modules\" (
    echo Installation des dépendances...
    call npm install
) else (
    echo Vérification des dépendances...
    call npm install
)

REM Construction de l'application
echo Construction de l'application...
call npm run build

echo Lancement de l'application...
start http://localhost:8080
call npm run dev

pause
