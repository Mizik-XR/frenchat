
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Préparation au déploiement Netlify

echo ===================================================
echo     PRÉPARATION AU DÉPLOIEMENT NETLIFY
echo ===================================================
echo.

REM Exécuter le script de mise à jour du package.json
echo [ÉTAPE 1/4] Mise à jour du package.json...
node scripts/update-package-json.js
if errorlevel 1 (
    echo [ERREUR] Échec de la mise à jour du package.json
    pause
    exit /b 1
)
echo.

REM Vérifier l'existence du fichier _redirects à la racine
echo [ÉTAPE 2/4] Vérification du fichier _redirects...
if not exist "_redirects" (
    echo [INFO] Création du fichier _redirects à la racine...
    echo /* /index.html 200 > _redirects
    echo [OK] Fichier _redirects créé.
) else (
    echo [OK] Le fichier _redirects existe déjà.
)
echo.

REM Construction du projet
echo [ÉTAPE 3/4] Construction du projet...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Échec de la construction du projet
    pause
    exit /b 1
)
echo.

REM Vérification finale
echo [ÉTAPE 4/4] Vérification finale...
if not exist "dist\_redirects" (
    echo [ATTENTION] Le fichier _redirects n'a pas été copié dans dist.
    echo [INFO] Copie manuelle du fichier _redirects...
    copy _redirects dist\_redirects
    echo [OK] Fichier _redirects copié dans dist.
) else (
    echo [OK] Le fichier _redirects est présent dans dist.
)

if exist "dist\index.html" (
    echo [OK] Le fichier index.html est présent dans dist.
) else (
    echo [ERREUR] Le fichier index.html est manquant dans dist.
    pause
    exit /b 1
)
echo.

echo ===================================================
echo     PRÉPARATION AU DÉPLOIEMENT TERMINÉE
echo ===================================================
echo.
echo Votre projet est prêt à être déployé sur Netlify.
echo.
echo Assurez-vous que dans les paramètres Netlify:
echo  1. Le dossier de publication est configuré sur "dist"
echo  2. La commande de build est "npm run build"
echo  3. Toutes les variables d'environnement sont configurées
echo.
pause
exit /b 0
