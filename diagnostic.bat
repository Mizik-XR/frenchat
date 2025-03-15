
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

REM Exécuter le diagnostic
call scripts\diagnostic.bat

echo.
echo Pour démarrer l'application avec les alertes techniques activées:
echo start-app.bat debug=true auth_key=filechat-debug-j8H2p!9a7b3c$5dEx dev_mode=true
echo.
pause
