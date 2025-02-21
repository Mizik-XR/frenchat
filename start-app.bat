
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
    if %ERRORLEVEL% NEQ 0 (
        echo Erreur lors de l'installation des dépendances
        pause
        exit
    )
)

echo Lancement de l'application...
start http://localhost:8080
call npm run dev

pause
