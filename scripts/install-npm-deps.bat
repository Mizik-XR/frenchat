
@echo off
echo [INFO] Installation des dépendances NPM...

REM Vérifier si npm est disponible
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas installé ou n'est pas dans le PATH.
    echo [INFO] Veuillez installer Node.js depuis https://nodejs.org/
    exit /b 1
)

REM Installer les dépendances
npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] L'installation des dépendances a échoué.
    exit /b 1
)

echo [OK] Dépendances NPM installées avec succès.
exit /b 0
