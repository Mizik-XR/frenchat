
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Démarrage minimal FileChat

echo ===================================================
echo      DÉMARRAGE MINIMAL DE FILECHAT
echo ===================================================
echo.
echo Ce script va démarrer FileChat en mode minimal
echo sans aucune fonctionnalité locale
echo.

REM Forcer le mode cloud et sécurisé
set "FORCE_CLOUD=1"
set "CLIENT_MODE=1"
set "SAFE_MODE=1"

REM Activer le mode de développement pour obtenir de meilleurs messages d'erreur
set "NODE_ENV=development"

REM Vérifier si dist existe
if not exist "dist\" (
    echo [ACTION] Construction de l'application...
    echo.

    REM Vérifier Node.js
    where node >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Node.js n'est pas installé.
        echo Veuillez installer Node.js depuis https://nodejs.org/
        echo.
        pause
        exit /b 1
    )

    REM Nettoyer l'installation si demandé
    if "%1"=="--clean" (
        echo [ACTION] Nettoyage complet des dépendances...
        if exist "node_modules\" rmdir /s /q node_modules
        if exist "dist\" rmdir /s /q dist
        del package-lock.json 2>nul
    )
    
    echo [ACTION] Installation des dépendances...
    call npm install --force
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Installation échouée.
        echo.
        pause
        exit /b 1
    )
    
    REM Construction spécifique
    echo [ACTION] Construction de l'application en mode minimal...
    call npm run build -- --mode production
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction échouée.
        echo.
        pause
        exit /b 1
    )
)

REM Démarrer le serveur web avec options simplifiées
echo [ACTION] Démarrage du serveur web...
start "Serveur FileChat" /min cmd /c "npx http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec options de sécurité maximale
echo [ACTION] Ouverture de l'application...
start "" "http://localhost:8080/?client=true&forceCloud=true&mode=safe&reset=partial"

echo.
echo ===================================================
echo       FILECHAT DÉMARRÉ EN MODE MINIMAL
echo ===================================================
echo.
echo L'application est accessible à l'adresse:
echo http://localhost:8080/?client=true^&forceCloud=true^&mode=safe
echo.
echo Commandes spéciales:
echo --clean  : Réinstallation complète (supprime node_modules et package-lock)
echo --debug  : Affiche les journaux détaillés pour le débogage
echo.
echo Cette fenêtre doit rester ouverte pendant l'utilisation de FileChat.
echo.
echo Appuyez sur Ctrl+C pour quitter.
echo.

REM Boucle pour garder la fenêtre ouverte
:boucle
timeout /t 60 /nobreak > nul
goto boucle
