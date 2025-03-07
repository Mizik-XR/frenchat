
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Correction des erreurs MIME pour Netlify

echo ===================================================
echo     CORRECTION DES ERREURS MIME POUR NETLIFY
echo ===================================================
echo.

REM Vérifier si nous sommes dans le répertoire racine du projet
if not exist "package.json" (
    echo [ERREUR] Ce script doit être exécuté depuis la racine du projet.
    pause
    exit /b 1
)

echo [ÉTAPE 1/3] Création des fichiers de configuration Netlify...

REM Créer/mettre à jour le fichier _headers
(
echo # En-têtes globaux pour tous les fichiers
echo /*
echo   X-Frame-Options: DENY
echo   X-XSS-Protection: 1; mode=block
echo   X-Content-Type-Options: nosniff
echo   Access-Control-Allow-Origin: *
echo   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
echo   Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey, x-client-info, range
echo   Access-Control-Max-Age: 86400
echo.
echo # En-têtes pour les fichiers JavaScript
echo /*.js
echo   Content-Type: application/javascript; charset=utf-8
echo.
echo # En-têtes pour les fichiers CSS
echo /*.css
echo   Content-Type: text/css; charset=utf-8
echo.
echo # En-têtes pour les assets dans le dossier /assets/
echo /assets/*
echo   Cache-Control: public, max-age=31536000, immutable
echo.
echo # En-têtes pour les polices
echo /*.woff
echo   Content-Type: font/woff
echo /*.woff2
echo   Content-Type: font/woff2
echo /*.ttf
echo   Content-Type: font/ttf
echo /*.eot
echo   Content-Type: application/vnd.ms-fontobject
) > _headers

echo [OK] Fichier _headers créé/mis à jour.

REM Créer/mettre à jour le fichier _redirects
(
echo # Redirection SPA - toutes les routes non existantes vers index.html
echo /*    /index.html   200
echo.
echo # Redirection API vers les fonctions Netlify
echo /api/*  /.netlify/functions/:splat  200
) > _redirects

echo [OK] Fichier _redirects créé/mis à jour.

echo [ÉTAPE 2/3] Construction optimisée du projet...

REM Nettoyer le dossier dist
if exist "dist" (
    rmdir /s /q dist
    echo [INFO] Dossier dist nettoyé.
)

REM Variables d'environnement pour Netlify
set "NO_RUST_INSTALL=1"
set "TRANSFORMERS_OFFLINE=1"
set "SKIP_PYTHON_INSTALLATION=true"
set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "NODE_OPTIONS=--max-old-space-size=4096"

REM Construction du projet
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction a échoué.
    pause
    exit /b 1
)

echo [OK] Projet construit avec succès.

echo [ÉTAPE 3/3] Post-traitement des fichiers pour Netlify...

REM Copier les fichiers _headers et _redirects dans le dossier dist
copy _headers dist\ > nul
copy _redirects dist\ > nul

REM Vérifier le Content-Type dans les balises script de index.html
if exist "dist\index.html" (
    echo [INFO] Modification des balises script dans index.html...
    
    REM Créer une copie temporaire de index.html
    type "dist\index.html" > "dist\index.html.tmp"
    
    REM Remplacer les balises script
    powershell -Command "(Get-Content 'dist\index.html.tmp') -replace 'type=""module"" src', 'type=""module"" crossorigin=""anonymous"" src' | Set-Content 'dist\index.html'"
    powershell -Command "(Get-Content 'dist\index.html') -replace 'src=""/', 'src=""./') | Set-Content 'dist\index.html.new'"
    powershell -Command "(Get-Content 'dist\index.html.new') -replace 'href=""/', 'href=""./') | Set-Content 'dist\index.html'"
    
    REM Supprimer les fichiers temporaires
    del "dist\index.html.tmp"
    del "dist\index.html.new"
    
    echo [OK] Fichier index.html traité.
) else (
    echo [ERREUR] Le fichier dist\index.html est manquant!
    pause
    exit /b 1
)

echo.
echo ===================================================
echo     CORRECTION TERMINÉE
echo ===================================================
echo.
echo Fichiers prêts pour Netlify. Pour déployer :
echo netlify deploy --prod --dir=dist
echo.
echo N'oubliez pas que les fichiers _headers et _redirects
echo sont maintenant inclus dans votre build.
echo.
pause
exit /b 0
