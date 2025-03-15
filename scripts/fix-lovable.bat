
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Update Lovable Integration

echo ===================================================
echo     UPDATING LOVABLE INTEGRATION
echo ===================================================
echo.
echo This tool will update Lovable integration with the latest features.
echo.

REM Check for lovable-tagger
echo [STEP 1/4] Checking for lovable-tagger...
call npm list lovable-tagger >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing lovable-tagger...
    call npm install --save-dev lovable-tagger
    if errorlevel 1 (
        echo [ERROR] Failed to install lovable-tagger.
        pause
        exit /b 1
    )
    echo [OK] lovable-tagger installed successfully.
) else (
    echo [OK] lovable-tagger is already installed.
)
echo.

REM Check Vite configuration
echo [STEP 2/4] Checking Vite configuration...
findstr "componentTagger" "vite.config.ts" >nul
if errorlevel 1 (
    echo [WARNING] componentTagger not found in vite.config.ts, updating...
    
    REM Backup original file
    copy vite.config.ts vite.config.ts.backup >nul
    
    REM Create a temporary file for the update
    (
        echo import { defineConfig } from "vite";
        echo import react from "@vitejs/plugin-react";
        echo import path from "path";
        echo import { componentTagger } from "lovable-tagger";
        echo.
        echo export default defineConfig(^({ mode ^}^) =^> ^(^{
        echo   server: {
        echo     host: "::",
        echo     port: 8080,
        echo   },
        echo   plugins: [
        echo     react^(^{
        echo       // Configurer React pour éviter les conflits potentiels
        echo       jsxRuntime: 'automatic',
        echo       babel: {
        echo         plugins: []
        echo       }
        echo     }^),
        echo     mode === 'development' ^&^& componentTagger^(^),
        echo   ].filter^(Boolean^),
        echo   resolve: {
        echo     alias: {
        echo       "@": path.resolve^(__dirname, "./src"^),
        echo     },
        echo   },
        echo   // Keep the rest of the configuration as is
        echo   build: {
        echo     // ... keep existing code
        echo   },
        echo   optimizeDeps: {
        echo     include: ['react', 'react-dom', 'react-router-dom'],
        echo     exclude: ['gptengineer', 'lovable-tagger']
        echo   },
        echo   assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg'],
        echo   define: {
        echo     __LOVABLE_MODE__: JSON.stringify^(mode === 'development' ? "development" : "production"^),
        echo   }
        echo }^)^);
    ) > vite.config.ts.new
    
    move /y vite.config.ts.new vite.config.ts >nul
    echo [OK] vite.config.ts updated successfully.
) else (
    echo [OK] vite.config.ts already has componentTagger configuration.
)
echo.

REM Check index.html file
echo [STEP 3/4] Checking index.html file...
if exist "index.html" (
    echo [INFO] Checking for gptengineer.js script...
    findstr "gptengineer.js" "index.html" >nul
    if errorlevel 1 (
        echo [WARNING] Lovable script is missing in index.html, fixing...
        
        REM Backup original file
        copy index.html index.html.backup >nul
        
        REM Create a temporary file for the update
        type nul > index.html.temp
        for /f "delims=" %%i in (index.html) do (
            echo %%i >> index.html.temp
            echo %%i | findstr "<script " >nul
            if errorlevel 0 (
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^> >> index.html.temp
            )
        )
        
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

REM Rebuild application
echo [STEP 4/4] Rebuilding application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Application rebuild failed.
    pause
    exit /b 1
) else (
    echo [OK] Application rebuilt successfully with Lovable updates.
)
echo.

echo ===================================================
echo     LOVABLE UPDATE COMPLETED
echo ===================================================
echo.
echo Your project has been updated with the latest Lovable features!
echo.
echo New capabilities include:
echo 1. Component tagging for improved editing
echo 2. Better hot reloading and state preservation
echo 3. Enhanced Lovable environment detection
echo.
echo To activate these features:
echo 1. Restart your development server
echo 2. Clear your browser cache or use incognito mode
echo.
pause
exit /b 0
