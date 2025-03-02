
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Préparation du déploiement

echo ===================================================
echo    PRÉPARATION DU DÉPLOIEMENT FILECHAT
echo ===================================================
echo.
echo Cette procédure va préparer le projet pour déploiement:
echo  1. Vérification des fichiers de configuration
echo  2. Optimisation du build
echo  3. Tests de pré-déploiement
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Nettoyer les fichiers inutiles
echo [ÉTAPE 1/4] Nettoyage des fichiers temporaires...
if exist "dist\" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Vérifier et préparer les fichiers de configuration
echo [ÉTAPE 2/4] Vérification des fichiers de configuration...
if not exist "netlify.toml" (
    echo [ERREUR] Le fichier netlify.toml est manquant.
    echo         Exécutez le script de génération de configuration.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Optimisation du build
echo [ÉTAPE 3/4] Optimisation et build du projet...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction du projet a échoué.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Projet construit avec succès.
echo.

REM Vérification post-build
echo [ÉTAPE 4/4] Vérification des fichiers de déploiement...
if not exist "dist\index.html" (
    echo [ERREUR] Le fichier dist\index.html est manquant.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Vérifier que le script Lovable est bien présent
findstr /c:"gptengineer.js" "dist\index.html" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html.
    call scripts\fix-blank-page.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible de corriger le problème.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Correction appliquée avec succès.
)

echo.
echo ===================================================
echo    PRÉPARATION DU DÉPLOIEMENT TERMINÉE
echo ===================================================
echo.
echo Votre projet est prêt à être déployé!
echo.
echo Vous pouvez maintenant:
echo  1. Déployer sur Netlify en connectant votre dépôt GitHub
echo  2. Déployer via la CLI Netlify: netlify deploy
echo  3. Utiliser le drag-and-drop du dossier 'dist' sur l'interface Netlify
echo.
echo Assurez-vous de configurer les variables d'environnement dans l'interface Netlify.
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
exit /b 0
