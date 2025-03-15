
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Fix Lovable Integration

echo ===================================================
echo     FIXING LOVABLE INTEGRATION
echo ===================================================
echo.
echo This tool will fix issues with Lovable editing.
echo.
echo [STEP 1/4] Checking index.html file...
if exist "index.html" (
    echo [INFO] Checking for gptengineer.js script...
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [WARNING] Lovable script is missing in index.html, fixing...
        
        REM Backup original file
        copy index.html index.html.backup >nul
        
        REM Modify index.html to add missing script
        (for /f "delims=" %%i in (index.html) do (
            echo %%i
            echo %%i | findstr "<head>" >nul
            if !errorlevel! EQU 0 (
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js"^>^</script^>
            )
        )) > index.html.temp
        
        move /y index.html.temp index.html >nul
        echo [OK] gptengineer.js script added to index.html.
    ) else (
        echo [INFO] Checking if type="module" needs to be removed...
        findstr "<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\">" "index.html" >nul
        if !errorlevel! EQU 0 (
            echo [WARNING] Found type="module" attribute, removing it...
            
            REM Backup original file
            copy index.html index.html.backup >nul
            
            REM Remove type="module" attribute
            powershell -Command "(Get-Content index.html) -replace '<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\">', '<script src=\"https://cdn.gpteng.co/gptengineer.js\">' | Set-Content index.html"
            
            echo [OK] type="module" attribute removed from gptengineer.js script.
        ) else (
            echo [OK] gptengineer.js script is correctly configured in index.html.
        )
    )
) else (
    echo [ERROR] index.html file is missing in the root directory.
    pause
    exit /b 1
)
echo.

echo [STEP 2/4] Clearing browser cache instructions...
echo [INFO] Please perform these steps in your browser:
echo   1. Open browser developer tools (F12 or right-click ^> Inspect)
echo   2. Go to Application/Storage tab
echo   3. Check 'Disable cache' option 
echo   4. Clear site data or use incognito mode for testing
echo.

echo [STEP 3/4] Rebuilding application...
REM Vérifier si npx est disponible
where npx >nul 2>nul
if !errorlevel! EQU 0 (
    if exist "node_modules\.bin\vite.cmd" (
        echo [INFO] Using local vite installation for build...
        call npx vite build
    ) else (
        echo [INFO] Using npm run build...
        call npm run build
    )
) else (
    echo [INFO] Using npm run build directly...
    call npm run build
)

if !errorlevel! NEQ 0 (
    echo [ERROR] Application rebuild failed.
    echo [ALTERNATIVE] Trying to install dependencies and rebuild...
    call npm install --no-fund --loglevel=error
    call npm run build
    if !errorlevel! NEQ 0 (
        echo [ERROR] Rebuild attempt failed after installing dependencies.
        pause
        exit /b 1
    )
) else (
    echo [OK] Application rebuilt successfully.
)
echo.

echo [STEP 4/4] Final verification...
if exist "dist\index.html" (
    echo [INFO] Checking dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [WARNING] gptengineer.js script is missing from dist\index.html.
        echo            Applying manual fix...
        copy /y index.html dist\index.html >nul
        echo [OK] Fix applied.
    ) else (
        echo [OK] dist\index.html contains the required script.
    )
) else (
    echo [INFO] dist folder doesn't exist yet.
)
echo.

echo ===================================================
echo     FIX COMPLETED
echo ===================================================
echo.
echo To apply changes:
echo 1. Restart the application
echo 2. Clear your browser cache or use incognito mode
echo 3. Try a different browser (Chrome or Edge recommended)
echo.
pause
exit /b 0
