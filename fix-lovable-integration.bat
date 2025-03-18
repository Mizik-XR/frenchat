
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Lovable - Diagnostic et réparation

echo ===================================================
echo     DIAGNOSTIC ET RÉPARATION LOVABLE
echo ===================================================
echo.
echo Cet outil va diagnostiquer et résoudre les problèmes
echo d'intégration Lovable dans votre application.
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Vérification de l'intégration dans index.html
echo [ÉTAPE 1/3] Vérification de index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [!] Script Lovable manquant dans index.html, correction...
        
        REM Sauvegarde de l'original
        copy index.html index.html.backup >nul
        
        REM Ajouter le script Lovable avant le script principal
        (for /f "delims=" %%i in (index.html) do (
            echo %%i | findstr "<script type=\"module\" src=\"/src/main.tsx\">" >nul
            if !errorlevel! EQU 0 (
                echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^>
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
            )
            echo %%i
        )) > index.html.temp
        
        move /y index.html.temp index.html >nul
        echo [✓] Script Lovable ajouté à index.html.
    ) else (
        echo [✓] Le script Lovable est présent dans index.html.
    )
) else (
    echo [✗] ERREUR: index.html introuvable. Avez-vous lancé ce script depuis le répertoire racine?
    goto :end
)
echo.

REM Vérification du build
echo [ÉTAPE 2/3] Vérification du build...
if exist "dist" (
    if exist "dist\index.html" (
        findstr "gptengineer.js" "dist\index.html" >nul
        if !errorlevel! NEQ 0 (
            echo [!] Script manquant dans le build, correction...
            copy /y index.html dist\index.html >nul
            echo [✓] Script Lovable ajouté au build.
        ) else (
            echo [✓] Le script Lovable est présent dans le build.
        )
    ) else (
        echo [!] Le fichier dist\index.html n'existe pas, un nouveau build est nécessaire.
    )
) else (
    echo [!] Le dossier dist n'existe pas, un build est nécessaire.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 3/3] Reconstruction de l'application...
call npm run build
if errorlevel 1 (
    echo [✗] La reconstruction a échoué. Vérifiez les erreurs.
) else (
    echo [✓] Application reconstruite avec succès.
)
echo.

:end
echo ===================================================
echo     DIAGNOSTIQUE TERMINÉ
echo ===================================================
echo.
echo Si vous continuez à rencontrer des problèmes:
echo 1. Redémarrez l'application avec "npm run dev"
echo 2. Videz le cache de votre navigateur ou utilisez le mode incognito
echo 3. Ouvrez la console développeur et exécutez: runLovableDiagnostic()
echo.
pause
exit /b 0
