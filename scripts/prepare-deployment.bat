
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo    FILECHAT PRÉPARATION AU DÉPLOIEMENT
echo ===================================================
echo.
echo Cette procédure va préparer le projet pour le déploiement:
echo  1. Vérification des fichiers de configuration
echo  2. Optimisation du build
echo  3. Tests pré-déploiement
echo  4. Correction des problèmes de MIME types connus
echo.
echo ===================================================
echo.
pause

REM Nettoyage des fichiers temporaires
echo [ÉTAPE 1/5] Nettoyage des fichiers temporaires...
if exist "dist" (
    rmdir /s /q dist
    echo [OK] Dossier dist supprimé avec succès.
) else (
    echo [INFO] Le dossier dist n'existe pas, étape ignorée.
)
echo.

REM Configuration pour le déploiement
set NODE_ENV=production

REM Vérification et préparation des fichiers de configuration
echo [ÉTAPE 2/5] Vérification des fichiers de configuration...
if not exist "vercel.json" (
    echo [ERREUR] Le fichier vercel.json est manquant.
    echo          Exécutez le script de génération de configuration.
    echo.
    pause
    exit /b 1
)

REM Optimisation et build
echo [ÉTAPE 3/5] Optimisation et build du projet...
set NODE_OPTIONS=--max-old-space-size=4096

REM Installation optimisée pour le déploiement
echo [INFO] Installation des dépendances avec configuration optimisée...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec du build du projet.
    echo.
    pause
    exit /b 1
)
echo [OK] Projet compilé avec succès.
echo.

REM Vérification post-build
echo [ÉTAPE 4/5] Vérification des fichiers de déploiement...
if not exist "dist\index.html" (
    echo [ERREUR] Le fichier dist\index.html est manquant.
    echo.
    pause
    exit /b 1
)

REM Vérification et correction des chemins absolus dans index.html
findstr "href=\"/assets" "dist\index.html" >nul
if %ERRORLEVEL% EQU 0 (
    echo [ATTENTION] Chemins absolus détectés dans index.html, conversion en chemins relatifs...
    powershell -Command "(Get-Content dist\index.html) -replace 'href=\"/assets', 'href=\"./assets' | Set-Content dist\index.html"
    echo [OK] Chemins href convertis avec succès.
)

findstr "src=\"/assets" "dist\index.html" >nul
if %ERRORLEVEL% EQU 0 (
    echo [ATTENTION] Chemins src absolus détectés dans index.html, conversion en chemins relatifs...
    powershell -Command "(Get-Content dist\index.html) -replace 'src=\"/assets', 'src=\"./assets' | Set-Content dist\index.html"
    echo [OK] Chemins src convertis avec succès.
)

REM Correction des problèmes de MIME types
echo [ÉTAPE 5/5] Correction des problèmes de MIME types pour Vercel...
node scripts\fix-vercel-mime-types.js
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Des problèmes ont été rencontrés lors de la correction des MIME types.
    echo            Le déploiement peut continuer, mais des erreurs pourraient survenir.
) else (
    echo [OK] Corrections des MIME types appliquées avec succès.
)

echo.
echo ===================================================
echo    PRÉPARATION AU DÉPLOIEMENT TERMINÉE
echo ===================================================
echo.
echo Votre projet est prêt à être déployé !
echo.
echo Vous pouvez maintenant :
echo  1. Déployer sur Vercel en connectant votre dépôt GitHub
echo  2. Déployer via la CLI Vercel : vercel deploy
echo  3. Utiliser le glisser-déposer du dossier 'dist' sur l'interface Vercel
echo.
echo N'oubliez pas de configurer les variables d'environnement dans l'interface Vercel.
echo.
pause
exit /b 0
