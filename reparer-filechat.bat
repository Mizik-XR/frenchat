
@echo off
chcp 65001 >nul
title Réparation FileChat

echo ===================================================
echo     OUTIL DE RÉPARATION FILECHAT
echo ===================================================
echo.
echo Cet outil va résoudre automatiquement les problèmes
echo courants de FileChat.
echo.
echo [1] Page blanche après chargement
echo [2] Erreur "AI edits didn't result in any changes"
echo [3] Problèmes d'affichage de l'interface
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Nettoyage du dossier dist
echo [ÉTAPE 1/3] Nettoyage de l'application...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Nettoyage effectué.
) else (
    echo [INFO] Aucun nettoyage nécessaire.
)
echo.

REM Vérifier et corriger index.html
echo [ÉTAPE 2/3] Vérification des fichiers...
if exist "index.html" (
    echo [INFO] Vérification du script gptengineer.js...
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Correction du fichier index.html...
        
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
        echo [OK] Fichier index.html corrigé.
    ) else (
        echo [OK] Le fichier index.html est correct.
    )
) else (
    echo [ATTENTION] Le fichier index.html est manquant.
    echo              Création d'un fichier index.html...
    
    (
        echo ^<!DOCTYPE html^>
        echo ^<html lang="en"^>
        echo   ^<head^>
        echo     ^<meta charset="UTF-8" /^>
        echo     ^<link rel="icon" type="image/svg+xml" href="/favicon.ico" /^>
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
        echo     ^<title^>FileChat - Votre assistant d'intelligence documentaire^</title^>
        echo     ^<meta name="description" content="FileChat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." /^>
        echo   ^</head^>
        echo   ^<body^>
        echo     ^<div id="root"^>^</div^>
        echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^>
        echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
        echo   ^</body^>
        echo ^</html^>
    ) > index.html
    
    echo [OK] Fichier index.html créé.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 3/3] Reconstruction de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Échec de la reconstruction. Tentative avec plus de mémoire...
    set NODE_OPTIONS=--max-old-space-size=4096
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Impossible de reconstruire l'application.
        echo.
        pause
        exit /b 1
    )
)
echo [OK] Application reconstruite avec succès.
echo.

echo ===================================================
echo     RÉPARATION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo FileChat a été réparé et est prêt à être utilisé!
echo.
echo Pour démarrer FileChat, utilisez:
echo - demarrer-filechat.bat     (Mode standard)
echo - demarrer-ia-locale.bat    (Avec IA locale)
echo.
pause
exit /b 0
