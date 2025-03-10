
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Cloud Mode

echo ===================================================
echo     FILECHAT - CLOUD MODE
echo ===================================================
echo.
echo This version starts FileChat in cloud-only mode,
echo without requiring a local AI server.
echo.

REM Check for http-server
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing http-server...
    call npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install http-server.
        pause
        exit /b 1
    )
    echo [OK] http-server installed.
) else (
    echo [OK] http-server is already installed.
)

REM Start HTTP server
echo [INFO] Starting HTTP server...
start "FileChat HTTP Server" /min cmd /c "http-server dist -p 8080 --cors -c-1"
echo [OK] HTTP server started.
echo.

REM Open browser with cloud parameters
timeout /t 1 /nobreak > nul
start "" "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

echo.
echo ===================================================
echo         FILECHAT STARTED IN CLOUD MODE
echo ===================================================
echo.
echo Web Application: http://localhost:8080/?client=true^&hideDebug=true^&forceCloud=true^&mode=cloud
echo.
echo To stop the service, close this window and the HTTP server window.
echo.
echo Press any key to close this window...
pause >nul

REM Close the process
taskkill /F /FI "WINDOWTITLE eq FileChat HTTP Server" >nul 2>nul

exit /b 0
