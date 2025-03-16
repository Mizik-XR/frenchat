
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Démarrage simplifié FileChat

echo ===================================================
echo      DÉMARRAGE SIMPLIFIÉ DE FILECHAT
echo ===================================================
echo.
echo Ce script va démarrer FileChat en mode cloud uniquement
echo (aucune installation locale requise)
echo.

REM Forcer le mode cloud
set "FORCE_CLOUD=1"
set "CLIENT_MODE=1"
set "SAFE_MODE=1"

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

    REM Installer les dépendances si nécessaire
    if not exist "node_modules\" (
        echo [ACTION] Installation des dépendances...
        call npm install --force
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] Installation échouée.
            echo.
            pause
            exit /b 1
        )
    )

    REM Construire l'application
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction échouée.
        echo.
        pause
        exit /b 1
    )
)

REM Copier le fichier de récupération si nécessaire
if not exist "dist\recovery.html" (
    copy "public\recovery.html" "dist\recovery.html" >nul
    echo [INFO] Fichier de récupération copié
)

REM Démarrer le serveur web
echo [ACTION] Démarrage du serveur web...
start "Serveur FileChat" /min cmd /c "npx http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec options sécurisées
echo [ACTION] Ouverture de l'application...
start "" "http://localhost:8080/?client=true&forceCloud=true&mode=safe"

echo.
echo ===================================================
echo       FILECHAT DÉMARRÉ EN MODE SIMPLIFIÉ
echo ===================================================
echo.
echo L'application est maintenant accessible à l'adresse:
echo http://localhost:8080/?client=true^&forceCloud=true^&mode=safe
echo.
echo Cette fenêtre doit rester ouverte pendant l'utilisation de FileChat.
echo.
echo Si l'application ne s'ouvre pas correctement, essayez:
echo http://localhost:8080/recovery.html
echo.
echo Appuyez sur Ctrl+C pour quitter.
echo.

REM Boucle pour garder la fenêtre ouverte
:boucle
timeout /t 60 /nobreak > nul
goto boucle
