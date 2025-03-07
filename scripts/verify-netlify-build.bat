
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Verification du build Netlify

echo ===================================================
echo     VERIFICATION DU BUILD NETLIFY
echo ===================================================
echo.

if not exist "dist" (
    echo [ERREUR] Le dossier dist n'existe pas.
    echo Veuillez executer 'npm run build' avant de verifier.
    pause
    exit /b 1
)

node scripts/verify-netlify-build.js

echo.
pause
