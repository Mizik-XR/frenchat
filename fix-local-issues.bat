
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Réparation des problèmes locaux

echo ===================================================
echo     OUTIL DE RÉPARATION POUR FILECHAT LOCAL
echo ===================================================
echo.
echo Cet outil va tenter de résoudre les problèmes de fonctionnement en local:
echo.
echo [1] Écran blanc / page qui ne se charge pas
echo [2] Problèmes d'édition avec Lovable
echo [3] Problèmes de connectivité locale à l'IA
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Nettoyage du cache de build
echo [ÉTAPE 1/5] Nettoyage du cache de build...
if exist ".vite\" (
    rmdir /s /q .vite
    echo [OK] Cache Vite supprimé.
) else (
    echo [INFO] Pas de cache Vite trouvé.
)

if exist "node_modules\.vite\" (
    rmdir /s /q node_modules\.vite
    echo [OK] Cache Vite dans node_modules supprimé.
)
echo.

REM Forcer le mode cloud
echo [ÉTAPE 2/5] Configuration du mode cloud forcé...
echo FORCE_CLOUD_MODE=true>.env.local
echo VITE_DISABLE_DEV_MODE=true>>.env.local
echo [OK] Mode cloud forcé configuré.
echo.

REM Reconstruire l'application
echo [ÉTAPE 3/5] Reconstruction complète de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    echo          Tentative avec plus de mémoire...
    set NODE_OPTIONS=--max-old-space-size=4096
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Reconstruction de l'application échouée.
        echo          Veuillez vérifier les erreurs de compilation.
        pause
        exit /b 1
    )
) else (
    echo [OK] Application reconstruite avec succès.
)
echo.

REM Vérification du script gptengineer.js
echo [ÉTAPE 4/5] Vérification des dépendances Lovable...
findstr "gptengineer.js" "dist\index.html" >nul
if !errorlevel! NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html.
    echo             Correction manuelle...
    
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

REM Démarrage en mode simplifié
echo [ÉTAPE 5/5] Démarrage en mode simplifié...
echo.
echo ===================================================
echo          RÉPARATION TERMINÉE
echo ===================================================
echo.
echo FileChat va maintenant démarrer en mode cloud simplifié.
echo Ce mode évite toute dépendance locale à une IA.
echo.
echo Options:
echo [1] Démarrer en mode cloud simplifié
echo [2] Quitter sans démarrer
echo.
set /p CHOICE="Votre choix [1/2]: "

if "%CHOICE%"=="1" (
    call start-app-simplified.bat
) else (
    echo.
    echo Pour démarrer ultérieurement, utilisez:
    echo start-app-simplified.bat
    echo.
    pause
)
exit /b 0
