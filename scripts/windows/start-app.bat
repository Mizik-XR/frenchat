
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Cloud Only Mode

echo ===================================================
echo     STARTING FILECHAT (CLOUD MODE)
echo ===================================================
echo.

REM Configure cloud-only mode
set FORCE_CLOUD_MODE=1
set CLIENT_MODE=1
set VITE_DISABLE_DEV_MODE=1

REM Check dist folder
if not exist "dist\" (
    echo [INFO] Building application...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Application build failed
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] Application built successfully.
    echo.
)

REM Check index.html file in dist
if not exist "dist\index.html" (
    echo [ERROR] File 'dist\index.html' is missing.
    echo [INFO] Rebuilding application...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Application build failed
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] Application built successfully.
    echo.
)

REM Check index.html content
findstr "gptengineer.js" "dist\index.html" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Lovable script missing in index.html, rebuilding...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Application build failed
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] Application rebuilt successfully.
    echo.
)

REM Check if http-server is installed
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing http-server...
    call npm install -g http-server
    if errorlevel 1 (
        echo [ERROR] http-server installation failed
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] http-server installed.
)

REM Set URL with normalized parameters
set "APP_URL=http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

REM Start web server
echo [INFO] Launching application...
start "FileChat HTTP Server" /min cmd /c "http-server dist -p 8080 --cors -c-1"
timeout /t 2 /nobreak > nul

REM Open browser
echo [INFO] Opening in your browser...
start "" "%APP_URL%"

echo.
echo ===================================================
echo         FILECHAT STARTED SUCCESSFULLY
echo         (CLOUD MODE ONLY)
echo ===================================================
echo.
echo The application uses AI in cloud mode only.
echo No Python installation is required.
echo.
echo Access URL: %APP_URL%
echo.
echo For Google OAuth configuration, use:
echo - Authorized JavaScript origin: http://localhost:8080
echo - Redirect URI: http://localhost:8080/auth/google/callback?client=true^&hideDebug=true^&forceCloud=true^&mode=cloud
echo.
echo To stop services, close this window and associated windows.
echo.
echo Press any key to close this window...
pause >nul

REM Close processes
taskkill /F /FI "WINDOWTITLE eq FileChat HTTP Server" >nul 2>nul

exit /b 0
