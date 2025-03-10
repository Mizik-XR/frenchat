
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Netlify Deployment

echo ===================================================
echo     FILECHAT NETLIFY DEPLOYMENT
echo ===================================================
echo.
echo This script will deploy FileChat to Netlify.
echo Make sure you have installed the Netlify CLI and
echo are logged in to your Netlify account.
echo.
echo Steps:
echo 1. Environment verification
echo 2. Build preparation for deployment
echo 3. Deployment to Netlify
echo.
echo ===================================================
echo.
echo Press any key to continue...
pause >nul

REM Check if netlify CLI is installed
where netlify >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Netlify CLI is not configured, installing...
    call npm install -g netlify-cli
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Netlify CLI installation failed.
        echo.
        echo To install manually, run:
        echo npm install -g netlify-cli
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [OK] Netlify CLI installed successfully.
)

REM Disable Rust installation for deployment
set "NO_RUST_INSTALL=1"
set "NETLIFY_SKIP_PYTHON=true"
set "TRANSFORMERS_OFFLINE=1"
set "NODE_ENV=production"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"

REM Clean up unused files
echo [INFO] Cleaning up temporary files...
if exist "dist\" rmdir /s /q dist

REM Optimized installation for Netlify
echo [INFO] Installing dependencies for Netlify...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

REM Run preparation script
echo [INFO] Running preparation script...
node scripts/netlify-prebuild.js

REM Prepare the build
echo [STEP 2/3] Preparing build for deployment...
set "NODE_OPTIONS=--max-old-space-size=4096"
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Build failed.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)
echo [OK] Build ready for deployment.
echo.

REM Check Netlify connection
echo [STEP 3/3] Checking Netlify connection...
netlify status >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] You are not logged in to Netlify.
    echo [INFO] Logging in to Netlify...
    netlify login
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to log in to Netlify.
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connected to Netlify.
echo.

REM Deploy to Netlify
echo [INFO] Would you like to:
echo 1. Deploy a preview
echo 2. Deploy to production
choice /C 12 /N /M "Choose an option (1 or 2): "

if !ERRORLEVEL! EQU 1 (
    echo [INFO] Deploying a preview...
    netlify deploy --dir=dist
) else (
    echo [INFO] Deploying to production...
    netlify deploy --prod --dir=dist
)

if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Deployment failed.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)
echo [OK] Deployment completed successfully.
echo.

echo ===================================================
echo     DEPLOYMENT COMPLETED
echo ===================================================
echo.
echo Remember to configure environment variables
echo in the Netlify interface for advanced features.
echo.
echo Variables to configure:
echo - VITE_SUPABASE_URL: Your Supabase project URL
echo - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
echo - VITE_CLOUD_API_URL: Cloud API URL (optional)
echo.
echo ===================================================
echo.
echo You can now share the deployment link with your client.
echo.
pause
exit /b 0
