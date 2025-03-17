
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Réparation intégration Lovable

echo ===================================================
echo     RÉPARATION INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Cet outil va résoudre les problèmes d'édition avec Lovable
echo et le problème "AI edits didn't result in any changes".
echo.

REM Vérification de index.html
echo [ÉTAPE 1/4] Vérification du fichier index.html...
if exist "index.html" (
    echo [INFO] Vérification de la présence du script gptengineer.js...
    findstr /C:"gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script Lovable manque dans index.html, correction...
        
        REM Sauvegarde du fichier original
        copy index.html index.html.backup >nul
        
        REM Injecter le script Lovable au début du head
        echo ^<!DOCTYPE html^> > index.html.temp
        echo ^<html lang="en"^> >> index.html.temp
        echo   ^<head^> >> index.html.temp
        echo     ^<meta charset="UTF-8" /^> >> index.html.temp
        echo     ^<link rel="icon" type="image/svg+xml" href="/favicon.ico" /^> >> index.html.temp
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^> >> index.html.temp
        echo     ^<title^>Frenchat - Votre assistant d'intelligence documentaire^</title^> >> index.html.temp
        echo     ^<meta name="description" content="Frenchat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." /^> >> index.html.temp
        echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" - Position optimisée --^> >> index.html.temp
        echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^> >> index.html.temp
        
        REM Copier le reste du fichier original
        findstr /v /C:"<!DOCTYPE html>" /C:"<html " /C:"<head>" /C:"<meta charset" /C:"<link rel=\"icon\"" /C:"<meta name=\"viewport\"" /C:"<title>" /C:"<meta name=\"description\"" "index.html" >> index.html.temp
        
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

REM Nettoyer les fichiers de build
echo [ÉTAPE 2/4] Nettoyage du dossier dist...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Reconstruction de l'application
echo [ÉTAPE 3/4] Reconstruction complète de l'application...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if errorlevel 1 (
    echo [ERREUR] Reconstruction de l'application échouée.
    pause
    exit /b 1
) else (
    echo [OK] Application reconstruite avec succès.
)
echo.

REM Vérification finale
echo [ÉTAPE 4/4] Vérification finale...
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ATTENTION] Le script Lovable est absent de dist\index.html.
        echo              Application d'une correction manuelle...
        
        copy index.html dist\index.html >nul
        echo [OK] Correction appliquée.
    ) else (
        echo [OK] Le fichier dist\index.html contient le script requis.
    )
) else (
    echo [INFO] Le dossier dist\index.html n'existe pas. Vérifiez la construction.
)
echo.

echo ===================================================
echo     RÉPARATION TERMINÉE
echo ===================================================
echo.
echo Le problème "AI edits didn't result in any changes" devrait être résolu.
echo.
echo Pour que les changements prennent effet:
echo 1. Redémarrez l'application
echo 2. Videz le cache de votre navigateur ou utilisez le mode incognito
echo 3. Si le problème persiste, essayez un autre navigateur (Chrome ou Edge)
echo.
pause
exit /b 0
