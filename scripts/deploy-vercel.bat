
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Deployment to Vercel

echo ===================================================
echo     DEPLOYING FILECHAT TO VERCEL
echo ===================================================
echo.
echo This script will deploy FileChat to Vercel.
echo Make sure you have installed the Vercel CLI and
echo are logged in to your Vercel account.
echo.
echo Steps:
echo 1. Environment verification
echo 2. Build preparation for deployment
echo 3. MIME headers configuration
echo 4. Vercel connection
echo 5. Deployment to Vercel
echo.
echo ===================================================
echo.
echo Press any key to continue...
pause >nul

REM Check if vercel CLI is installed
where vercel >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Vercel CLI is not configured, installing...
    call npm install -g vercel
    
    REM Check if installation succeeded
    where vercel >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [WARNING] Automatic installation failed, trying with --force...
        call npm install -g vercel --force
        
        REM Check again
        where vercel >nul 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [ERROR] Failed to install Vercel CLI.
            echo.
            echo Try manually with:
            echo npm install -g vercel
            echo or
            echo yarn global add vercel
            echo.
            
            echo Do you want to continue with npx vercel? (Y/N)
            choice /C YN /N /M "Choice: "
            if !ERRORLEVEL! NEQ 1 (
                echo Deployment cancelled.
                exit /b 1
            )
            set "VERCEL_CMD=npx vercel"
        ) else (
            echo [OK] Vercel CLI installed successfully (alternative method).
            set "VERCEL_CMD=vercel"
        )
    ) else (
        echo [OK] Vercel CLI installed successfully.
        set "VERCEL_CMD=vercel"
    )
) else (
    echo [OK] Vercel CLI already installed.
    set "VERCEL_CMD=vercel"
)

REM Configuration for deployment
set "NODE_ENV=production"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "SKIP_PYTHON_INSTALLATION=true"

REM Clean up unneeded files
echo [INFO] Cleaning up temporary files...
if exist "dist\" rmdir /s /q dist

REM Optimized installation for Vercel
echo [INFO] Installing dependencies with Vercel configuration...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

REM Prepare the build
echo [STEP 2/5] Preparing build for deployment...
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

REM Configure Vercel headers for MIME types
echo [STEP 3/5] Configuring headers for MIME types...
node scripts/vercel-headers.js
if !ERRORLEVEL! NEQ 0 (
    echo [WARNING] Header configuration failed, but deployment will continue.
)

REM Check Vercel connection
echo [STEP 4/5] Checking Vercel connection...
%VERCEL_CMD% whoami >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] You are not logged in to Vercel.
    echo [INFO] Logging in to Vercel...
    %VERCEL_CMD% login
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to log in to Vercel.
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connected to Vercel.
echo.

REM Deploy to Vercel
echo [STEP 5/5] Would you like to:
echo 1. Deploy a preview
echo 2. Deploy to production
choice /C 12 /N /M "Choose an option (1 or 2): "

if !ERRORLEVEL! EQU 1 (
    echo [INFO] Deploying a preview...
    %VERCEL_CMD%
) else (
    echo [INFO] Deploying to production...
    %VERCEL_CMD% --prod
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
echo in the Vercel interface for advanced features.
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
