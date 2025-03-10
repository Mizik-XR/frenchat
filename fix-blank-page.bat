
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Frenchat - Réparation page blanche (Netlify)

echo ===================================================
echo     OUTIL DE RÉPARATION PAGE BLANCHE NETLIFY
echo ===================================================
echo.
echo Cet outil va tenter de résoudre le problème de page blanche
echo sur le déploiement Netlify en modifiant la configuration CSP
echo et en corrigeant les erreurs connues de React/Sentry.
echo.
echo Étapes de réparation :
echo 1. Vérification de l'environnement
echo 2. Modification du fichier netlify.toml
echo 3. Correction des headers de sécurité
echo 4. Injection de polyfills pour unstable_scheduleCallback
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer la réparation...
pause >nul

REM Créer fichier unstable_scheduler_fix.js
echo [ÉTAPE 1/4] Création du polyfill pour unstable_scheduleCallback...
mkdir -p dist\polyfills 2>nul

(
echo // Polyfill pour les fonctions React manquantes
echo window.unstable_scheduleCallback = window.unstable_scheduleCallback || function() { 
echo   console.warn^('Polyfill: unstable_scheduleCallback appelé'^);
echo   return null;
echo };
echo window.unstable_cancelCallback = window.unstable_cancelCallback || function() { 
echo   console.warn^('Polyfill: unstable_cancelCallback appelé'^);
echo   return null;
echo };
echo // Éviter les erreurs Sentry
echo window.Sentry = window.Sentry || {
echo   init: function^(^) { return false; },
echo   captureException: function^(^) { return false; }
echo };
echo console.log^('Polyfills React/Sentry chargés'^);
) > dist\polyfills\scheduler-fix.js

echo [OK] Polyfill créé.

REM Modifier le fichier index.html pour inclure le polyfill
echo [ÉTAPE 2/4] Ajout du polyfill à index.html...
if exist "dist\index.html" (
    echo [INFO] Modification de index.html...
    powershell -command "(Get-Content dist\index.html) -replace '<head>', '<head>\n  <script src=\"/polyfills/scheduler-fix.js\"></script>' | Set-Content dist\index.html.temp"
    copy "dist\index.html.temp" "dist\index.html" >nul
    del "dist\index.html.temp" >nul
    echo [OK] Polyfill ajouté à index.html.
) else (
    echo [ERREUR] Fichier index.html non trouvé dans le dossier dist.
    echo Exécutez d'abord "npm run build" pour créer le dossier dist.
    exit /b 1
)

REM Mise à jour des headers CSP
echo [ÉTAPE 3/4] Mise à jour des headers CSP...
if exist "dist\_headers" (
    echo [INFO] Mise à jour de _headers...
    
    (
    echo /* 
    echo   X-Frame-Options: DENY 
    echo   X-XSS-Protection: 1; mode=block 
    echo   X-Content-Type-Options: nosniff
    echo   Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://* https://*.sentry.io https://*.ingest.sentry.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://*.sentry-cdn.com https://*.sentry.io https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: * 'unsafe-inline'; worker-src 'self' blob:; font-src 'self' https://fonts.gstatic.com https: data:;
    echo.
    echo /diagnostic.html
    echo   Content-Security-Policy: default-src 'self'; connect-src 'self' https://* http://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https: data:;
    echo.
    echo /minimal.html
    echo   Content-Security-Policy: default-src 'self'; connect-src 'self' https://* http://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https: data:;
    ) > dist\_headers
    
    echo [OK] Fichier _headers mis à jour.
) else (
    echo [ATTENTION] Fichier _headers non trouvé, création...
    
    (
    echo /* 
    echo   X-Frame-Options: DENY 
    echo   X-XSS-Protection: 1; mode=block 
    echo   X-Content-Type-Options: nosniff
    echo   Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://* https://*.sentry.io https://*.ingest.sentry.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://*.sentry-cdn.com https://*.sentry.io https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: * 'unsafe-inline'; worker-src 'self' blob:; font-src 'self' https://fonts.gstatic.com https: data:;
    ) > dist\_headers
    
    echo [OK] Fichier _headers créé.
)

REM Mise à jour des redirections
echo [ÉTAPE 4/4] Mise à jour des redirections...
if exist "dist\_redirects" (
    echo [INFO] Mise à jour de _redirects...
    
    (
    echo # Redirection SPA pour toutes les routes
    echo /*    /index.html   200 
    echo.
    echo # Redirection vers la page de diagnostic
    echo /diagnostic    /diagnostic.html   200
    echo.
    echo # Redirection vers la page minimale
    echo /minimal    /minimal.html   200
    ) > dist\_redirects
    
    echo [OK] Fichier _redirects mis à jour.
) else (
    echo [ATTENTION] Fichier _redirects non trouvé, création...
    
    (
    echo # Redirection SPA pour toutes les routes
    echo /*    /index.html   200 
    echo.
    echo # Redirection vers la page de diagnostic
    echo /diagnostic    /diagnostic.html   200
    echo.
    echo # Redirection vers la page minimale
    echo /minimal    /minimal.html   200
    ) > dist\_redirects
    
    echo [OK] Fichier _redirects créé.
)

echo.
echo ===================================================
echo             RÉPARATION TERMINÉE
echo ===================================================
echo.
echo Actions à effectuer :
echo 1. Redéployez le contenu du dossier dist sur Netlify
echo 2. Accédez à votre site Netlify
echo 3. Si la page blanche persiste, allez sur /minimal.html ou /diagnostic.html
echo.
echo Pour déployer à nouveau sur Netlify, utilisez la commande :
echo npx netlify deploy --prod --dir=dist
echo.
pause
exit /b 0
