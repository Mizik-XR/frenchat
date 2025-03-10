
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
echo [STEP 1/3] Checking index.html file...
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
            echo %%i | findstr "<script " >nul
            if !errorlevel! EQU 0 (
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
            )
        )) > index.html.temp
        
        move /y index.html.temp index.html >nul
        echo [OK] gptengineer.js script added to index.html.
    ) else (
        echo [OK] gptengineer.js script is already present in index.html.
    )
) else (
    echo [ERROR] index.html file is missing in the root directory.
    pause
    exit /b 1
)
echo.

echo [STEP 2/3] Rebuilding application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Application rebuild failed.
    pause
    exit /b 1
) else (
    echo [OK] Application rebuilt successfully.
)
echo.

echo [STEP 3/3] Final verification...
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
echo.
pause
exit /b 0
