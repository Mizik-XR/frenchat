
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title DÉMARRAGE D'URGENCE FILECHAT

echo ===================================================
echo      DÉMARRAGE D'URGENCE DE FILECHAT
echo ===================================================
echo.
echo Ce script va démarrer FileChat en mode ultra-minimal
echo pour contourner les problèmes d'initialisation React.
echo.

REM Nettoyer le cache et forcer le mode cloud
echo [ACTION] Nettoyage du cache local...
del /q "dist\*.map" 2>nul
echo [ACTION] Forçage du mode cloud...
echo true > "FORCE_CLOUD_MODE"

REM Vérifier dist ou le créer ultra-minimal si nécessaire
if not exist "dist\" (
    echo [ACTION] Création d'un fichier d'urgence minimal...
    mkdir "dist" 2>nul
    
    echo ^<!DOCTYPE html^> > "dist\index.html"
    echo ^<html lang="fr"^> >> "dist\index.html"
    echo ^<head^> >> "dist\index.html"
    echo   ^<meta charset="UTF-8" /^> >> "dist\index.html"
    echo   ^<title^>FileChat - Mode d'urgence^</title^> >> "dist\index.html"
    echo   ^<style^>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#f0f7ff}^</style^> >> "dist\index.html"
    echo ^</head^> >> "dist\index.html"
    echo ^<body^> >> "dist\index.html"
    echo   ^<h1^>FileChat - Mode d'urgence^</h1^> >> "dist\index.html"
    echo   ^<p^>Redirection vers la version cloud...^</p^> >> "dist\index.html"
    echo   ^<script^>window.location.href='https://filechat.vercel.app/?forceCloud=true'^</script^> >> "dist\index.html"
    echo ^</body^> >> "dist\index.html"
    echo ^</html^> >> "dist\index.html"
) else (
    echo [ACTION] Le dossier dist existe déjà.
)

REM Démarrer un serveur HTTP ultra-simple
echo [ACTION] Démarrage du serveur d'urgence...
start "Serveur d'urgence FileChat" /min cmd /c "npx serve dist -p 8888 --no-clipboard"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [ACTION] Ouverture du navigateur...
start "" "http://localhost:8888/?emergency=true&forceCloud=true"

echo.
echo ===================================================
echo     FILECHAT DÉMARRÉ EN MODE D'URGENCE
echo ===================================================
echo.
echo L'application est maintenant accessible à l'adresse:
echo http://localhost:8888/?emergency=true^&forceCloud=true
echo.
echo Cette version contourne les problèmes d'initialisation React.
echo.
echo Appuyez sur Ctrl+C pour quitter.

REM Boucle pour garder la fenêtre ouverte
:loop
timeout /t 60 /nobreak > nul
goto loop
