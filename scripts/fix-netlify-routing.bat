
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Correction du routage Netlify

echo ===================================================
echo     CORRECTION DU ROUTAGE NETLIFY
echo ===================================================
echo.

REM 1. Mettre à jour le fichier _redirects
echo 1. Mise à jour du fichier _redirects...
echo /*  /index.html  200 > _redirects
echo [OK] Fichier _redirects créé avec le contenu exact demandé.

REM 2. S'assurer que le fichier sera copié dans le dossier de build
echo 2. Vérification du dossier de build...
if exist "dist" (
    echo [INFO] Copie du fichier _redirects dans le dossier dist...
    copy _redirects dist\ > nul
    echo [OK] Fichier _redirects copié dans dist/
) else (
    echo [INFO] Dossier dist non trouvé. Le fichier sera copié lors du prochain build.
)

REM 3. Déclencher un nouveau déploiement si git est disponible
echo 3. Tentative de déclencher un nouveau déploiement...
where git >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    git add _redirects
    git commit -m "Fix: Mise à jour des règles de redirection Netlify pour SPA"
    git push
    echo [OK] Modifications envoyées vers GitHub. Netlify devrait lancer un nouveau déploiement.
) else (
    echo [INFO] Git n'est pas disponible. Veuillez committer manuellement le fichier _redirects.
    echo        Suivez ces étapes manuelles:
    echo        1. Ouvrez GitHub Desktop
    echo        2. Committer le fichier _redirects avec message 'Fix: Mise à jour des règles de redirection Netlify pour SPA'
    echo        3. Cliquez sur Push origin pour envoyer vers GitHub
)

echo.
echo ===================================================
echo     INSTRUCTIONS SUPPLEMENTAIRES
echo ===================================================
echo.
echo Si Netlify ne déclenche pas automatiquement un déploiement:
echo 1. Connectez-vous à l'interface Netlify (app.netlify.com)
echo 2. Sélectionnez votre site
echo 3. Allez dans l'onglet 'Deploys'
echo 4. Cliquez sur 'Trigger deploy' puis 'Deploy site'
echo.
echo Assurez-vous que le dossier de publication est configuré sur 'dist'
echo dans les paramètres de build de Netlify.
echo.
pause
