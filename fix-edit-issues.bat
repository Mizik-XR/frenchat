
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Correction problèmes d'édition

echo ===================================================
echo     CORRECTION PROBLÈMES D'ÉDITION LOVABLE
echo ===================================================
echo.
echo Cet outil va corriger le problème "AI edits didn't result in any changes"
echo en vérifiant que le script gptengineer.js est correctement intégré.
echo.
echo ===================================================
echo.

REM Vérifier et corriger index.html
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
            echo %%i | findstr "<script type=\"module\" src=\"/src/main.tsx\"></script>" >nul
            if !errorlevel! EQU 0 (
                echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^>
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

REM Vérification dans le répertoire dist
echo [ÉTAPE 2/3] Vérification du fichier dist/index.html...
if exist "dist\index.html" (
    echo [INFO] Vérification de la présence du script gptengineer.js dans le build...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script Lovable manque dans dist/index.html, correction...
        
        REM Copier le fichier index.html corrigé dans dist
        copy /y index.html dist\index.html >nul
        echo [OK] Script gptengineer.js ajouté dans dist/index.html.
    ) else (
        echo [OK] Le script gptengineer.js est déjà présent dans dist/index.html.
    )
) else (
    echo [INFO] Le dossier dist n'existe pas ou n'a pas encore été généré.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 3/3] Reconstruction de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    echo         Veuillez exécuter fix-blank-page.bat pour une réparation complète.
    pause
    exit /b 1
) else (
    echo [OK] Application reconstruite avec succès.
)
echo.

echo ===================================================
echo     CORRECTION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo La correction du problème d'édition est terminée.
echo.
echo Si vous êtes en train d'utiliser l'application:
echo 1. Fermez-la et relancez-la avec start-app-simplified.bat
echo 2. Effacez le cache de votre navigateur ou utilisez le mode incognito
echo.
echo Si le problème persiste:
echo 1. Essayez d'utiliser Chrome ou Edge au lieu de Firefox
echo 2. Vérifiez que JavaScript est activé dans votre navigateur
echo.
pause
exit /b 0
