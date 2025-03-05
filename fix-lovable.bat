
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Fix Lovable Integration

echo ===================================================
echo     RÉPARATION INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Cet outil va résoudre les problèmes d'édition Lovable.
echo.
echo [ÉTAPE 1/3] Vérification du fichier index.html...
if exist "index.html" (
    echo [INFO] Vérification de la présence du script gptengineer.js...
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script Lovable manque dans index.html, correction...
        
        REM Sauvegarde du fichier original
        copy index.html index.html.backup >nul
        
        REM Modifier le fichier index.html pour ajouter le script manquant
        (for /f "delims=" %%i in (index.html) do (
            echo %%i
            echo %%i | findstr "<script " >nul
            if !errorlevel! EQU 0 (
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
            )
        )) > index.html.temp
        
        move /y index.html.temp index.html >nul
        echo [OK] Script gptengineer.js ajouté dans index.html.
    ) else (
        echo [OK] Le script gptengineer.js est déjà présent dans index.html.
    )
) else (
    echo [ERREUR] Le fichier index.html est manquant dans le répertoire racine.
    pause
    exit /b 1
)
echo.

echo [ÉTAPE 2/3] Reconstruction de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    pause
    exit /b 1
) else (
    echo [OK] Application reconstruite avec succès.
)
echo.

echo [ÉTAPE 3/3] Vérification finale...
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script gptengineer.js est absent de dist\index.html.
        echo             Application d'une correction manuelle...
        copy /y index.html dist\index.html >nul
        echo [OK] Correction appliquée.
    ) else (
        echo [OK] Le fichier dist\index.html contient le script requis.
    )
) else (
    echo [INFO] Le dossier dist n'existe pas encore.
)
echo.

echo ===================================================
echo     RÉPARATION TERMINÉE
echo ===================================================
echo.
echo Pour appliquer les changements:
echo 1. Redémarrez l'application
echo 2. Videz le cache de votre navigateur ou utilisez le mode incognito
echo.
pause
exit /b 0
