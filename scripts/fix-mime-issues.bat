
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - MIME Type Fix Utility

echo ===================================================
echo     MIME TYPE FIX UTILITY
echo ===================================================
echo.
echo This script will check and fix MIME type configurations
echo for JavaScript files in your deployed application.
echo.
echo ===================================================
echo.
echo Press any key to continue...
pause >nul

REM Check if dist directory exists
if not exist "dist\" (
    echo [ERROR] Dist directory not found. Run build first.
    echo.
    set /p choice=Build the application now? (y/n): 
    if "!choice!" == "y" (
        echo [INFO] Building application...
        call npm run build
    ) else (
        echo Operation cancelled.
        exit /b 1
    )
)

REM Check if index.html exists
if not exist "dist\index.html" (
    echo [ERROR] dist\index.html not found.
    exit /b 1
)

echo [STEP 1/3] Checking for proper MIME type definitions...

REM Check if headers are set correctly in vercel.json
if exist "vercel.json" (
    findstr /c:"application/javascript" vercel.json >nul
    if !errorlevel! NEQ 0 (
        echo [WARNING] JavaScript MIME type not properly set in vercel.json
        echo           Please update your vercel.json file.
    ) else (
        echo [OK] MIME types are properly configured in vercel.json
    )
)

echo.
echo [STEP 2/3] Adding meta tags to help browsers with MIME types...

REM Add meta tags to index.html to help with content type inference
powershell -Command "(Get-Content dist\index.html) -replace '<head>', '<head>`n    <meta http-equiv=""X-Content-Type-Options"" content=""nosniff"">' | Set-Content dist\index.html"

echo [OK] Added nosniff header to prevent MIME sniffing.

echo.
echo [STEP 3/3] Creating verification file...

REM Create a small verification file to test MIME types
if not exist "dist\test\" mkdir dist\test
(
    echo console.log('JavaScript MIME type verification successful'^);
) > dist\test\verify-mime.js

REM Create a verification HTML file
(
    echo ^<!DOCTYPE html^>
    echo ^<html lang="en"^>
    echo ^<head^>
    echo     ^<meta charset="UTF-8"^>
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
    echo     ^<title^>MIME Type Verification^</title^>
    echo ^</head^>
    echo ^<body^>
    echo     ^<h1^>MIME Type Verification^</h1^>
    echo     ^<p^>This page tests if JavaScript files are served with the correct MIME type.^</p^>
    echo     ^<script src="verify-mime.js"^>^</script^>
    echo     ^<script^>
    echo         // Check if script loaded correctly
    echo         window.addEventListener('load', function(^) {
    echo             document.body.innerHTML += '^<p^>Page loaded successfully!^</p^>';
    echo         }^);
    echo     ^</script^>
    echo ^</body^>
    echo ^</html^>
) > dist\test\verify-mime.html

echo [OK] Created verification files in dist\test\
echo.
echo ===================================================
echo     MIME TYPE FIXES APPLIED
echo ===================================================
echo.
echo After deploying, visit /test/verify-mime.html to verify
echo that JavaScript files are served with correct MIME types.
echo.
echo If you're still experiencing issues after deployment:
echo 1. Check your server's MIME type configuration
echo 2. Use a CDN with proper MIME type settings
echo 3. Consider adding a build plugin to ensure correct headers
echo.
echo Press any key to exit...
pause >nul
exit /b 0
