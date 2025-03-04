
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Maintenance

echo ===================================================
echo     MAINTENANCE DE FILECHAT
echo ===================================================
echo.
echo [1] Nettoyage de cache
echo [2] Reconstruction de l'application
echo [3] Vérification de l'environnement
echo [4] Réparation des problèmes courants
echo [5] Quitter
echo.
set /p CHOICE="Votre choix [1-5]: "

if "%CHOICE%"=="1" goto clean_cache
if "%CHOICE%"=="2" goto rebuild_app
if "%CHOICE%"=="3" goto check_env
if "%CHOICE%"=="4" goto repair
if "%CHOICE%"=="5" goto end

:clean_cache
cls
echo ===================================================
echo     NETTOYAGE DE CACHE
echo ===================================================
echo.
echo [INFO] Suppression des caches...
if exist ".vite\" (
    rmdir /s /q .vite
    echo [OK] Cache Vite supprimé.
)
if exist "node_modules\.vite\" (
    rmdir /s /q node_modules\.vite
    echo [OK] Cache Vite dans node_modules supprimé.
)
call npm cache clean --force
echo [OK] Cache NPM nettoyé.
echo.
pause
goto end

:rebuild_app
cls
echo ===================================================
echo     RECONSTRUCTION DE L'APPLICATION
echo ===================================================
echo.
echo [INFO] Construction de l'application...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la construction.
    pause
    goto end
)
echo [OK] Application reconstruite avec succès.
echo.
pause
goto end

:check_env
cls
echo ===================================================
echo     VÉRIFICATION DE L'ENVIRONNEMENT
echo ===================================================
echo.
echo [INFO] Vérification de Node.js...
node -v
echo [INFO] Vérification de NPM...
npm -v
echo [INFO] Vérification de Python...
python --version
echo.
if exist ".env.local" (
    echo [INFO] Fichier .env.local détecté.
) else (
    echo [INFO] Création du fichier .env.local...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_ENVIRONMENT=development
        echo VITE_SITE_URL=http://localhost:8080
        echo VITE_LOVABLE_VERSION=dev
        echo FORCE_CLOUD_MODE=true
    ) > .env.local
    echo [OK] Fichier .env.local créé.
)
echo.
pause
goto end

:repair
cls
echo ===================================================
echo     RÉPARATION DES PROBLÈMES COURANTS
echo ===================================================
echo.
echo [INFO] Vérification des dépendances...
call npm install
echo [INFO] Configuration du mode cloud...
echo FORCE_CLOUD_MODE=true > .env.local
echo VITE_DISABLE_DEV_MODE=true >> .env.local
echo [INFO] Reconstruction de l'application...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
echo.
echo [INFO] Vérification du script Lovable...
findstr "gptengineer.js" "dist\index.html" >nul
if !errorlevel! NEQ 0 (
    echo [INFO] Ajout du script Lovable...
    (for /f "delims=" %%i in (dist\index.html) do (
        echo %%i | findstr "<script type=\"module\" crossorigin" >nul
        if !errorlevel! EQU 0 (
            echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        )
        echo %%i
    )) > dist\index.html.temp
    move /y dist\index.html.temp dist\index.html >nul
    echo [OK] Script Lovable ajouté.
) else (
    echo [OK] Script Lovable déjà présent.
)
echo.
echo [OK] Réparation terminée.
pause
goto end

:end
exit /b 0
