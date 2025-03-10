
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Launcher

echo ===================================================
echo     FILECHAT - LAUNCHER
echo ===================================================
echo.
echo Choose a startup mode:
echo.
echo [1] Full mode (Local AI + web interface)
echo [2] Cloud mode only (without local AI)
echo [3] Maintenance (cleanup, repair)
echo [4] Exit
echo.
set /p CHOICE="Your choice [1-4]: "

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
    echo Invalid choice. Please try again.
    timeout /t 2 /nobreak > nul
    cls
    call %0
)

exit /b 0
