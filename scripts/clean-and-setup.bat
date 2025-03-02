
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Nettoyage et Configuration

REM Vérifier les droits d'administrateur pour éviter les problèmes de permission
NET SESSION >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Ce script n'est pas exécuté en tant qu'administrateur.
    echo             Certaines opérations pourraient échouer.
    echo             Il est recommandé de l'exécuter en tant qu'administrateur.
    echo.
    pause
)

echo ===================================================
echo     NETTOYAGE ET CONFIGURATION DE FILECHAT
echo ===================================================
echo.
echo Cette procédure va nettoyer l'environnement et 
echo réinstaller toutes les dépendances. Cela peut
echo prendre plusieurs minutes.
echo.
echo Actions:
echo 1. Supprimer node_modules, dist, et venv
echo 2. Nettoyer le cache npm
echo 3. Réinstaller les dépendances npm
echo 4. Recréer l'environnement Python
echo 5. Préparer l'environnement pour le développement local
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Suppression des dossiers
echo [ÉTAPE 1/5] Suppression des dossiers...
if exist "node_modules\" (
    echo [INFO] Suppression de node_modules...
    rmdir /s /q node_modules
    if errorlevel 1 (
        echo [ATTENTION] Problème lors de la suppression de node_modules.
        echo             Certains fichiers peuvent être verrouillés.
        echo             Continuons tout de même...
    )
)
if exist "dist\" (
    echo [INFO] Suppression de dist...
    rmdir /s /q dist
)
if exist "venv\" (
    echo [INFO] Suppression de venv...
    rmdir /s /q venv
)
if exist ".netlify\" (
    echo [INFO] Suppression de .netlify...
    rmdir /s /q .netlify
)
echo [OK] Dossiers supprimés avec succès.
echo.

REM Nettoyage du cache npm
echo [ÉTAPE 2/5] Nettoyage du cache npm...
call npm cache clean --force
echo [OK] Cache npm nettoyé.
echo.

REM Réinstallation des dépendances npm
echo [ÉTAPE 3/5] Réinstallation des dépendances npm...
echo [INFO] Installation des dépendances avec npm ci (installation propre)...
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] npm ci a échoué, essai avec npm install...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation des dépendances npm.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Dépendances npm installées avec succès.
echo.

REM Recréation de l'environnement Python
echo [ÉTAPE 4/5] Recréation de l'environnement Python...
call scripts\setup-venv.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la configuration de l'environnement Python.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Environnement Python configuré avec succès.
echo.

REM Préparation de l'environnement pour le développement local
echo [ÉTAPE 5/5] Préparation de l'environnement de développement...
echo [INFO] Construction du projet...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la construction du projet.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Projet construit avec succès.
echo.

echo ===================================================
echo     NETTOYAGE ET CONFIGURATION TERMINÉS
echo ===================================================
echo.
echo Votre environnement est maintenant prêt!
echo.
echo Pour démarrer l'application:
echo 1. En mode complet (IA locale + web): start-app.bat
echo 2. En mode cloud uniquement: start-cloud-mode.bat
echo 3. En mode simplifié: scripts\start-app-simplified.bat
echo.
echo Pour tester le déploiement Netlify en local:
echo - netlify dev
echo.
echo Pour déployer sur Netlify:
echo - netlify deploy --prod
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0
