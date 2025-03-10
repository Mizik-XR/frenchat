
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Fix Editing Issues

echo ===================================================
echo     FIXING LOVABLE EDITING ISSUES
echo ===================================================
echo.
echo This tool will fix the "AI edits didn't result in any changes"
echo issue by ensuring the gptengineer.js script is properly integrated.
echo.
echo ===================================================
echo.

REM Display Supabase debug info
echo [INFO] Supabase Environment Variables
echo VITE_SUPABASE_URL=%VITE_SUPABASE_URL%
echo VITE_SUPABASE_ANON_KEY defined: %VITE_SUPABASE_ANON_KEY:~0,5%...
echo.

REM Check and fix index.html
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
            echo %%i | findstr "<script type=\"module\" src=\"/src/main.tsx\"></script>" >nul
            if !errorlevel! EQU 0 (
                echo     ^<!-- Script required for Lovable "Pick and Edit" functionality --^>
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

REM Check dist directory
echo [STEP 2/3] Checking dist/index.html file...
if exist "dist\index.html" (
    echo [INFO] Checking for gptengineer.js script in build...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [WARNING] Lovable script is missing in dist/index.html, fixing...
        
        REM Copy corrected index.html to dist
        copy /y index.html dist\index.html >nul
        echo [OK] gptengineer.js script added to dist/index.html.
    ) else (
        echo [OK] gptengineer.js script is already present in dist/index.html.
    )
) else (
    echo [INFO] dist folder doesn't exist or hasn't been generated yet.
)
echo.

REM Rebuild the application
echo [STEP 3/3] Rebuilding application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Application rebuild failed.
    echo         Please run fix-blank-page.bat for a complete repair.
    pause
    exit /b 1
) else (
    echo [OK] Application rebuilt successfully.
)
echo.

echo ===================================================
echo     FIX COMPLETED SUCCESSFULLY
echo ===================================================
echo.
echo The editing issue fix is complete.
echo.
echo If you are currently using the application:
echo 1. Close and restart it with start-app-simplified.bat
echo 2. Clear your browser cache or use incognito mode
echo.
echo If the issue persists:
echo 1. Try using Chrome or Edge instead of Firefox
echo 2. Make sure JavaScript is enabled in your browser
echo.
pause
exit /b 0
