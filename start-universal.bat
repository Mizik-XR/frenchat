
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo            DÉMARRAGE UNIVERSEL DE FILECHAT
echo ===================================================
echo.

rem Vérification de la présence du script Lovable
echo [INFO] Vérification de la configuration Lovable...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Script Lovable manquant, correction en cours...
        call fix-edit-issues.bat
    ) else (
        echo [OK] Configuration Lovable correcte.
    )
) else (
    echo [ATTENTION] index.html introuvable, vérification avancée nécessaire.
    if exist "scripts\fix-blank-page.bat" (
        call scripts\fix-blank-page.bat
    ) else (
        echo [ERREUR] Impossible de trouver les scripts de réparation.
        exit /b 1
    )
)

rem Choix du mode de démarrage
echo.
echo Choisissez le mode de démarrage :
echo 1. Mode développement (npm run dev)
echo 2. Mode production locale (start-app.bat)
echo 3. Mode cloud uniquement (start-cloud-mode.bat)
echo.
set /p choice="Votre choix [1-3] (1 par défaut): "

if "%choice%"=="2" (
    echo [INFO] Démarrage en mode production locale...
    call start-app.bat
) else if "%choice%"=="3" (
    echo [INFO] Démarrage en mode cloud uniquement...
    call start-cloud-mode.bat
) else (
    echo [INFO] Démarrage en mode développement...
    call npm run dev
)

exit /b 0
