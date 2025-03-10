
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Lovable - Integration Diagnostic

echo ===================================================
echo     LOVABLE INTEGRATION DIAGNOSTIC
echo ===================================================
echo.
echo This tool will analyze Lovable integration in
echo your application and suggest solutions.
echo.
echo ===================================================
echo.
echo Press any key to start analysis...
pause >nul

REM Check Lovable script
echo [TEST 1/5] Checking for Lovable script in index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [FAIL] Lovable script is not present in index.html.
        set LOVABLE_SCRIPT_ISSUE=1
    ) else (
        echo [OK] Lovable script is present in index.html.
    )
) else (
    echo [FAIL] index.html file is missing.
    set LOVABLE_SCRIPT_ISSUE=1
)
echo.

REM Check script in build
echo [TEST 2/5] Checking for Lovable script in build (dist)...
if exist "dist\index.html" (
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [FAIL] Lovable script is not present in the build.
        set LOVABLE_BUILD_ISSUE=1
    ) else (
        echo [OK] Lovable script is present in the build.
    )
) else (
    echo [INFO] dist folder doesn't exist yet. A build is needed.
    set LOVABLE_BUILD_ISSUE=1
)
echo.

REM Check environment variables
echo [TEST 3/5] Checking project configuration...
if exist ".env.local" (
    findstr "VITE_DISABLE_DEV_MODE=1" ".env.local" >nul
    if !errorlevel! NEQ 0 (
        echo [INFO] Development mode is enabled, which may interfere with Lovable.
        set ENV_ISSUE=1
    ) else (
        echo [OK] Correct configuration.
    )
) else (
    echo [INFO] .env.local file missing, default configuration used.
)
echo.

REM Test build
echo [TEST 4/5] Quick build test...
call npm run build --silent
if !errorlevel! NEQ 0 (
    echo [FAIL] Project build failed.
    set BUILD_ISSUE=1
) else (
    echo [OK] Build successful.
)
echo.

REM Check browser (Chrome recommended)
echo [TEST 5/5] Checking default browser...
reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.html\UserChoice" /v "ProgId" 2>nul | findstr "ChromeHTML" >nul
if !errorlevel! NEQ 0 (
    echo [INFO] Chrome is not your default browser.
    echo        Chrome or Edge are recommended for editing with Lovable.
    set BROWSER_ISSUE=1
) else (
    echo [OK] Chrome is your default browser.
)
echo.

echo ===================================================
echo     DIAGNOSTIC RESULTS
echo ===================================================
echo.

REM Display summary and recommendations
set ISSUES_FOUND=0
if defined LOVABLE_SCRIPT_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [ISSUE] Lovable script is not properly integrated.
    echo         Run fix-edit-issues.bat to fix this.
)
if defined LOVABLE_BUILD_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [ISSUE] Build does not contain Lovable script.
    echo         Run fix-edit-issues.bat then rebuild.
)
if defined ENV_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [ISSUE] Environment configuration not optimal for Lovable.
    echo         Add VITE_DISABLE_DEV_MODE=1 to your .env.local file.
)
if defined BUILD_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [ISSUE] Build failure.
    echo         Check error messages and fix issues.
)
if defined BROWSER_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [ISSUE] Browser not optimal for editing with Lovable.
    echo         Use Google Chrome or Microsoft Edge.
)

if %ISSUES_FOUND% EQU 0 (
    echo [RESULT] No issues detected with Lovable integration.
    echo          If problems persist:
    echo          1. Clear your browser cache
    echo          2. Disable extensions that might interfere
    echo          3. Try another browser (Chrome or Edge)
) else (
    echo [RESULT] %ISSUES_FOUND% issue(s) detected.
    echo          Follow the recommendations above.
)
echo.

echo ===================================================
echo To automatically fix detected issues,
echo run: fix-edit-issues.bat
echo ===================================================
echo.
pause
exit /b 0
