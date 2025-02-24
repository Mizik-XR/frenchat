
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

REM Nettoyage des anciens fichiers de build
echo Nettoyage des anciens fichiers...
if exist "dist" rd /s /q "dist"
if exist "node_modules" rd /s /q "node_modules"

echo Installation des dépendances...
call npm install

echo Construction de l'application...
call npm run build

echo Lancement de l'application...
start http://localhost:8080
call npm run dev

pause
