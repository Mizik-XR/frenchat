
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Fix Lovable Issues

echo ===================================================
echo     CORRECTION AVANCÉE DES PROBLÈMES LOVABLE
echo ===================================================
echo.

REM Vérifier l'index.html
echo [ÉTAPE 1/5] Vérification et correction de index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [CORRECTION] Ajout du script Lovable dans index.html
        copy index.html index.html.backup >nul
        
        REM Insérer le script Lovable immédiatement après l'ouverture du head
        (for /f "delims=" %%i in (index.html) do (
            echo %%i
            echo %%i | findstr "<head>" >nul
            if !errorlevel! EQU 0 (
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
            )
        )) > index.html.temp
        
        move /y index.html.temp index.html >nul
    ) else (
        echo [OK] Script Lovable présent dans index.html
    )
) else (
    echo [ERREUR] Fichier index.html non trouvé
    exit /b 1
)
echo.

REM Nettoyer le cache npm
echo [ÉTAPE 2/5] Nettoyage du cache npm...
call npm cache clean --force
echo [OK] Cache npm nettoyé
echo.

REM Nettoyer le dossier node_modules
echo [ÉTAPE 3/5] Suppression des dépendances existantes...
if exist "node_modules" (
    rd /s /q node_modules
    echo [OK] Dossier node_modules supprimé
) else (
    echo [INFO] Dossier node_modules non trouvé
)
echo.

REM Réinstaller les dépendances
echo [ÉTAPE 4/5] Réinstallation des dépendances...
call npm install
if !errorlevel! NEQ 0 (
    echo [ERREUR] Échec de la réinstallation des dépendances
    exit /b 1
) else (
    echo [OK] Dépendances réinstallées avec succès
)
echo.

REM Reconstruire l'application
echo [ÉTAPE 5/5] Reconstruction de l'application...
call npm run build
if !errorlevel! NEQ 0 (
    echo [ERREUR] Échec de la reconstruction
    exit /b 1
) else (
    echo [OK] Application reconstruite avec succès
)
echo.

echo ===================================================
echo     CORRECTION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo Pour appliquer les corrections:
echo 1. Redémarrez l'application
echo 2. Videz le cache de votre navigateur ou utilisez une fenêtre de navigation privée
echo.
echo Si le problème persiste, essayez d'utiliser un autre navigateur 
echo (Chrome ou Edge sont recommandés)
echo.
pause
exit /b 0
