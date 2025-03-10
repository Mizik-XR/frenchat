
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Maintenance

echo ===================================================
echo     FILECHAT MAINTENANCE
echo ===================================================
echo.
echo [1] Cache Cleanup
echo [2] Rebuild Application
echo [3] Check Environment
echo [4] Fix Common Issues
echo [5] Exit
echo.
set /p CHOICE="Your choice [1-5]: "

if "%CHOICE%"=="1" goto clean_cache
if "%CHOICE%"=="2" goto rebuild_app
if "%CHOICE%"=="3" goto check_env
if "%CHOICE%"=="4" goto repair
if "%CHOICE%"=="5" goto end

:clean_cache
cls
echo ===================================================
echo     CACHE CLEANUP
echo ===================================================
echo.
echo [INFO] Removing caches...
if exist ".vite\" (
    rmdir /s /q .vite
    echo [OK] Vite cache removed.
)
if exist "node_modules\.vite\" (
    rmdir /s /q node_modules\.vite
    echo [OK] Vite cache in node_modules removed.
)
call npm cache clean --force
echo [OK] NPM cache cleaned.
echo.
pause
goto end

:rebuild_app
cls
echo ===================================================
echo     REBUILD APPLICATION
echo ===================================================
echo.
echo [INFO] Building application...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    goto end
)
echo [OK] Application rebuilt successfully.
echo.
pause
goto end

:check_env
cls
echo ===================================================
echo     ENVIRONMENT CHECK
echo ===================================================
echo.
echo [INFO] Checking Node.js...
node -v
echo [INFO] Checking NPM...
npm -v
echo [INFO] Checking Python...
python --version
echo.
if exist ".env.local" (
    echo [INFO] .env.local file detected.
) else (
    echo [INFO] Creating .env.local file...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_ENVIRONMENT=development
        echo VITE_SITE_URL=http://localhost:8080
        echo VITE_LOVABLE_VERSION=dev
        echo FORCE_CLOUD_MODE=true
    ) > .env.local
    echo [OK] .env.local file created.
)
echo.
pause
goto end

:repair
cls
echo ===================================================
echo     FIX COMMON ISSUES
echo ===================================================
echo.
echo [INFO] Checking dependencies...
call npm install
echo [INFO] Configuring cloud mode...
echo FORCE_CLOUD_MODE=true > .env.local
echo VITE_DISABLE_DEV_MODE=true >> .env.local
echo [INFO] Rebuilding application...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
echo.
echo [INFO] Checking Lovable script...
findstr "gptengineer.js" "dist\index.html" >nul
if !errorlevel! NEQ 0 (
    echo [INFO] Adding Lovable script...
    (for /f "delims=" %%i in (dist\index.html) do (
        echo %%i | findstr "<script type=\"module\" crossorigin" >nul
        if !errorlevel! EQU 0 (
            echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        )
        echo %%i
    )) > dist\index.html.temp
    move /y dist\index.html.temp dist\index.html >nul
    echo [OK] Lovable script added.
) else (
    echo [OK] Lovable script already present.
)
echo.
echo [OK] Repair completed.
pause
goto end

:end
exit /b 0
