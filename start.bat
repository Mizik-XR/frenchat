
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Lanceur

echo ===================================================
echo     FILECHAT - LANCEUR
echo ===================================================
echo.
echo Choisissez un mode de démarrage:
echo.
echo [1] Mode complet (IA locale + interface web)
echo [2] Mode cloud uniquement (sans IA locale)
echo [3] Maintenance (nettoyage, réparation)
echo [4] Quitter
echo.
set /p CHOICE="Votre choix [1-4]: "

if "%CHOICE%"=="1" (
    call scripts\windows\start-app.bat
) else if "%CHOICE%"=="2" (
    call scripts\windows\cloud-mode.bat
) else if "%CHOICE%"=="3" (
    call scripts\windows\maintenance.bat
) else if "%CHOICE%"=="4" (
    exit /b 0
) else (
    echo.
    echo Choix invalide. Veuillez réessayer.
    timeout /t 2 /nobreak > nul
    cls
    call %0
)

exit /b 0
