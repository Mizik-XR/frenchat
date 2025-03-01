
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Réparation page blanche et problèmes d'édition

echo ===================================================
echo     OUTIL DE RÉPARATION FILECHAT
echo ===================================================
echo.
echo Cet outil va tenter de résoudre les problèmes suivants:
echo.
echo [1] Page blanche après chargement
echo [2] Erreur "AI edits didn't result in any changes"
echo [3] Problèmes d'édition avec Lovable
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Nettoyer le dossier dist
echo [ÉTAPE 1/4] Nettoyage du dossier dist...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Vérifier et corriger index.html
echo [ÉTAPE 2/4] Vérification du fichier index.html...
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
        echo [INFO] Vérifions l'ordre des scripts...
        
        REM Vérifie si le script gptengineer.js est avant le script main.tsx
        findstr /B /C:"    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>" index.html >nul
        set FOUND_SCRIPT=!errorlevel!
        
        findstr /B /C:"    <script type=\"module\" src=\"/src/main.tsx\"></script>" index.html >nul
        set FOUND_MAIN=!errorlevel!
        
        if !FOUND_SCRIPT! EQU 0 if !FOUND_MAIN! EQU 0 (
            echo [INFO] Les deux scripts sont présents, vérifions leur ordre...
            
            REM Sauvegarde du fichier original
            copy index.html index.html.backup >nul
            
            REM Créer un fichier temporaire pour réorganiser les scripts si nécessaire
            type nul > index.html.temp
            set SCRIPT_FOUND=0
            set MAIN_FOUND=0
            set NEED_REORGANIZE=0
            
            for /f "delims=" %%i in (index.html) do (
                echo %%i | findstr /C:"gptengineer.js" >nul
                if !errorlevel! EQU 0 (
                    set SCRIPT_FOUND=1
                )
                
                echo %%i | findstr /C:"main.tsx" >nul
                if !errorlevel! EQU 0 (
                    set MAIN_FOUND=1
                    if !SCRIPT_FOUND! EQU 0 (
                        set NEED_REORGANIZE=1
                        echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^> >> index.html.temp
                        echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^> >> index.html.temp
                    )
                )
                
                echo %%i >> index.html.temp
            )
            
            if !NEED_REORGANIZE! EQU 1 (
                move /y index.html.temp index.html >nul
                echo [OK] Ordre des scripts corrigé dans index.html.
            ) else (
                del index.html.temp
                echo [OK] L'ordre des scripts est déjà correct.
            )
        )
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
    
    echo [OK] Fichier index.html créé avec succès.
)
echo.

REM Vérification du node_modules
echo [ÉTAPE 3/4] Vérification des dépendances...
if not exist "node_modules\" (
    echo [ATTENTION] Le dossier node_modules est manquant.
    echo [INFO] Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Installation des dépendances échouée.
        echo         Essai avec --legacy-peer-deps...
        call npm install --legacy-peer-deps
    )
) else (
    echo [OK] Le dossier node_modules existe.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 4/4] Reconstruction complète de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    echo         Essai avec NODE_OPTIONS=--max-old-space-size=4096...
    set NODE_OPTIONS=--max-old-space-size=4096
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] Reconstruction de l'application échouée.
        echo          Vérifiez les messages d'erreur ci-dessus.
        echo.
        echo Réparation terminée avec erreurs. Veuillez contacter le support technique.
        pause >nul
        exit /b 1
    )
) else (
    echo [OK] Application reconstruite avec succès.
)

REM Vérification finale du fichier dist/index.html
if exist "dist\index.html" (
    echo [INFO] Vérification finale du fichier dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script gptengineer.js est absent du fichier dist\index.html.
        echo             Cela est probablement dû à une configuration de build incorrecte.
        echo             Copie manuelle du fichier index.html vers dist...
        
        copy index.html dist\index.html >nul
        echo [OK] Fichier index.html copié manuellement vers dist.
    ) else (
        echo [OK] Le fichier dist\index.html contient le script gptengineer.js.
    )
)
echo.

echo ===================================================
echo     RÉPARATION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo Veuillez maintenant lancer l'application avec la commande:
echo .\start-app.bat
echo.
echo Si le problème persiste:
echo 1. Vérifiez avec .\scripts\diagnostic.bat
echo 2. Essayez le mode compatible: .\start-cloud-mode.bat
echo 3. Essayez le lancement en tant qu'administrateur
echo.
pause
exit /b 0
