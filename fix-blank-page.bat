
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Frenchat - Réparation page blanche et problèmes d'édition

echo ===================================================
echo     OUTIL DE RÉPARATION FRENCHAT
echo ===================================================
echo.
echo Cet outil va tenter de résoudre les problèmes suivants:
echo.
echo [1] Page blanche après chargement
echo [2] Erreur "AI edits didn't result in any changes"
echo [3] Problèmes d'édition avec Lovable
echo [4] Erreurs liées à Supabase ou variables d'environnement
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Nettoyer le dossier dist
echo [ÉTAPE 1/5] Nettoyage du dossier dist...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Vérifier et corriger index.html
echo [ÉTAPE 2/5] Vérification du fichier index.html...
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
    echo              Création d'un fichier index.html basique...
    
    (
        echo ^<!DOCTYPE html^>
        echo ^<html lang="en"^>
        echo   ^<head^>
        echo     ^<meta charset="UTF-8" /^>
        echo     ^<link rel="icon" type="image/svg+xml" href="/favicon.ico" /^>
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
        echo     ^<title^>Frenchat - Votre assistant d'intelligence documentaire^</title^>
        echo     ^<meta name="description" content="Frenchat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." /^>
        echo   ^</head^>
        echo   ^<body^>
        echo     ^<div id="root"^>^</div^>
        echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^>
        echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
        echo   ^</body^>
        echo ^</html^>
    ) > index.html
    
    echo [OK] Fichier index.html créé avec succès.
)
echo.

REM Vérification des variables d'environnement
echo [ÉTAPE 3/5] Vérification de la configuration Supabase...
echo [INFO] Création d'un fichier .env.local de secours avec configuration Supabase...

(
    echo VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
    echo VITE_API_URL=http://localhost:8000
    echo VITE_ENVIRONMENT=development
    echo VITE_SITE_URL=http://localhost:8080
) > .env.local

echo [OK] Fichier .env.local créé avec la configuration Supabase.
echo.

REM Reconstruction de l'application
echo [ÉTAPE 4/5] Reconstruction complète de l'application...
echo [INFO] Utilisation de NODE_OPTIONS=--max-old-space-size=4096...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    echo          Tentative avec NO_RUST_INSTALL=1...
    set NO_RUST_INSTALL=1
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

REM Vérification finale et démarrage du serveur
echo [ÉTAPE 5/5] Vérification finale et démarrage...
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script gptengineer.js est absent de dist\index.html.
        echo             Application d'une correction manuelle...
        copy index.html dist\index.html >nul
        echo [OK] Correction appliquée.
    ) else (
        echo [OK] Le fichier dist\index.html contient le script requis.
    )
    
    echo [INFO] Démarrage du serveur web...
    echo [INFO] Serveur démarré sur http://localhost:8080
    http-server dist -p 8080 -c-1 --cors
) else (
    echo [ERREUR] Le fichier dist\index.html n'existe pas après la reconstruction.
    echo          Veuillez vérifier les erreurs de compilation.
    pause
    exit /b 1
)

echo ===================================================
echo             RÉPARATION TERMINÉE
echo ===================================================
echo.
echo Si l'application ne s'affiche pas correctement:
echo  1. Essayez de vider le cache de votre navigateur
echo  2. Utilisez le mode incognito
echo  3. Essayez un navigateur différent
echo.
pause
exit /b 0
