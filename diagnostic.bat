
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Enable developer mode for diagnostics
set "VITE_DEBUG_MODE=1"
set "DEV_MODE=1"

echo ===================================================
echo     FILECHAT DIAGNOSTIC LAUNCH
echo           (DEVELOPER MODE)
echo ===================================================
echo.

REM Run diagnostic
call scripts\diagnostic.bat

echo.
echo To start the application with technical alerts enabled:
echo start-app.bat debug=true auth_key=filechat-debug-j8H2p!9a7b3c$5dEx dev_mode=true
echo.
pause
