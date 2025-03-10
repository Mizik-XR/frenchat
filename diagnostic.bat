
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Activer le mode développeur pour le diagnostic
set "VITE_DEBUG_MODE=1"
set "DEV_MODE=1"

echo ===================================================
echo     LANCEMENT DU DIAGNOSTIC FILECHAT 
echo           (MODE DÉVELOPPEUR)
echo ===================================================
echo.

REM Afficher le menu de diagnostic
echo Options de diagnostic disponibles:
echo 1. Diagnostic général
echo 2. Diagnostic d'images
echo 3. Vérifier le déploiement Netlify
echo 4. Lancer l'application en mode debug
echo 5. Ouvrir la page diagnostic dans le navigateur
echo 6. Quitter
echo.

choice /C 123456 /N /M "Choisissez une option (1-6): "

if %ERRORLEVEL% EQU 1 (
    echo [INFO] Lancement du diagnostic général...
    call scripts\diagnostic.bat
) else if %ERRORLEVEL% EQU 2 (
    echo [INFO] Lancement du diagnostic d'images...
    
    REM Vérifier si le fichier existe
    if not exist "public\image-diagnostic.html" (
        echo [ERREUR] Le fichier image-diagnostic.html n'existe pas.
        echo [INFO] Création du fichier...
        copy NUL "public\image-diagnostic.html"
        echo ^<!DOCTYPE html^> > "public\image-diagnostic.html"
        echo ^<html^>^<head^>^<title^>Diagnostic d'Images^</title^>^</head^> >> "public\image-diagnostic.html"
        echo ^<body^>^<h1^>Diagnostic d'Images FileChat^</h1^>^<p^>Page de diagnostic en cours de création...^</p^>^</body^>^</html^> >> "public\image-diagnostic.html"
    )
    
    start "" "public\image-diagnostic.html"
) else if %ERRORLEVEL% EQU 3 (
    echo [INFO] Vérification du déploiement Netlify...
    call scripts\verify-netlify-deployment.bat
) else if %ERRORLEVEL% EQU 4 (
    echo [INFO] Lancement de l'application en mode debug...
    start "" cmd /c "start-app.bat debug=true auth_key=filechat-debug-j8H2p!9a7b3c$5dEx dev_mode=true"
) else if %ERRORLEVEL% EQU 5 (
    echo [INFO] Ouverture de la page de diagnostic dans le navigateur...
    start "" "http://localhost:5173/diagnostic.html"
) else (
    echo [INFO] Sortie du programme.
    exit /b 0
)

echo.
echo Pour démarrer l'application avec les alertes techniques activées:
echo start-app.bat debug=true auth_key=filechat-debug-j8H2p!9a7b3c$5dEx dev_mode=true
echo.
pause
