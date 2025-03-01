
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Réparation page blanche

echo ===================================================
echo     OUTIL DE RÉPARATION FILECHAT
echo ===================================================
echo.
echo Cet outil va tenter de résoudre le problème de page blanche
echo en effectuant les opérations suivantes:
echo.
echo [1] Nettoyage complet du dossier dist
echo [2] Vérification et correction du fichier index.html
echo [3] Reconstruction forcée de l'application
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Nettoyer le dossier dist
echo [ÉTAPE 1/3] Nettoyage du dossier dist...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Vérifier et corriger index.html
echo [ÉTAPE 2/3] Vérification du fichier index.html...
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
    echo [ATTENTION] Le fichier index.html est manquant dans le répertoire racine.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 3/3] Reconstruction forcée de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    echo         Vérifiez les messages d'erreur ci-dessus.
    echo.
    echo Réparation terminée avec erreurs. Veuillez contacter le support technique.
    pause >nul
    exit /b 1
) else (
    echo [OK] Application reconstruite avec succès.
)
echo.

echo ===================================================
echo     RÉPARATION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo Veuillez maintenant lancer l'application avec la commande:
echo start-app.bat
echo.
echo Si le problème persiste, essayez également:
echo 1. Vérifier avec scripts\diagnostic.bat
echo 2. Lancer en mode cloud avec start-cloud-mode.bat
echo.
pause
exit /b 0
