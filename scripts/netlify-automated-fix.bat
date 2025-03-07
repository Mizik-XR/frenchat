
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Correction automatique Netlify - FileChat

echo ===================================================
echo     CORRECTION AUTOMATIQUE NETLIFY
echo ===================================================
echo.
echo Ce script va automatiquement:
echo 1. Créer les fichiers de configuration Netlify nécessaires
echo 2. Preparer votre projet pour le déploiement
echo 3. Vous guider pour committer et pousser les changements
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour commencer...
pause >nul

REM Créer les fichiers de configuration Netlify
echo [ETAPE 1/3] Création des fichiers de configuration Netlify...

REM Créer/mettre à jour le fichier _headers
echo # En-têtes globaux pour tous les fichiers > _headers
echo /* >> _headers
echo   X-Frame-Options: DENY >> _headers
echo   X-XSS-Protection: 1; mode=block >> _headers
echo   X-Content-Type-Options: nosniff >> _headers
echo. >> _headers
echo # En-têtes pour les fichiers JavaScript >> _headers
echo /*.js >> _headers
echo   Content-Type: application/javascript; charset=utf-8 >> _headers
echo. >> _headers
echo # En-têtes pour les fichiers CSS >> _headers
echo /*.css >> _headers
echo   Content-Type: text/css; charset=utf-8 >> _headers
echo. >> _headers
echo # En-têtes pour les assets dans le dossier /assets/ >> _headers
echo /assets/* >> _headers
echo   Cache-Control: public, max-age=31536000, immutable >> _headers
echo. >> _headers
echo # En-têtes pour les polices >> _headers
echo /*.woff >> _headers
echo   Content-Type: font/woff >> _headers
echo /*.woff2 >> _headers
echo   Content-Type: font/woff2 >> _headers
echo /*.ttf >> _headers
echo   Content-Type: font/ttf >> _headers
echo /*.eot >> _headers
echo   Content-Type: application/vnd.ms-fontobject >> _headers

echo [OK] Fichier _headers créé.

REM Créer/mettre à jour le fichier _redirects
echo # Redirection SPA - toutes les routes non existantes vers index.html > _redirects
echo /*    /index.html   200 >> _redirects
echo. >> _redirects
echo # Redirection API vers les fonctions Netlify >> _redirects
echo /api/*  /.netlify/functions/:splat  200 >> _redirects

echo [OK] Fichier _redirects créé.

REM Créer/mettre à jour le fichier netlify.toml
echo # Configuration de build Netlify pour FileChat > netlify.toml
echo [build] >> netlify.toml
echo   publish = "dist" >> netlify.toml
echo   command = "npm run build" >> netlify.toml
echo. >> netlify.toml
echo # Configuration des variables d'environnement par défaut >> netlify.toml
echo [build.environment] >> netlify.toml
echo   NODE_VERSION = "18" >> netlify.toml
echo   NPM_FLAGS = "--prefer-offline --no-audit --no-fund" >> netlify.toml
echo   NODE_OPTIONS = "--max-old-space-size=4096" >> netlify.toml
echo   NO_RUST_INSTALL = "1" >> netlify.toml
echo   NETLIFY_USE_YARN = "false" >> netlify.toml
echo   TRANSFORMERS_OFFLINE = "1" >> netlify.toml
echo   CI = "true" >> netlify.toml
echo   SKIP_PYTHON_INSTALLATION = "true" >> netlify.toml
echo   NETLIFY_SKIP_PYTHON_REQUIREMENTS = "true" >> netlify.toml
echo   VITE_CLOUD_MODE = "true" >> netlify.toml
echo   VITE_ALLOW_LOCAL_AI = "false" >> netlify.toml
echo. >> netlify.toml
echo # Configuration des redirections pour le routage SPA >> netlify.toml
echo [[redirects]] >> netlify.toml
echo   from = "/*" >> netlify.toml
echo   to = "/index.html" >> netlify.toml
echo   status = 200 >> netlify.toml
echo   force = true >> netlify.toml
echo   >> netlify.toml
echo # Rediriger les API vers les fonctions Netlify >> netlify.toml
echo [[redirects]] >> netlify.toml
echo   from = "/api/*" >> netlify.toml
echo   to = "/.netlify/functions/:splat" >> netlify.toml
echo   status = 200 >> netlify.toml
echo. >> netlify.toml
echo # Configuration des fonctions Netlify >> netlify.toml
echo [functions] >> netlify.toml
echo   directory = "netlify/functions" >> netlify.toml
echo   node_bundler = "esbuild" >> netlify.toml
echo   included_files = ["**/*.model"] >> netlify.toml
echo   external_node_modules = ["@supabase/supabase-js"] >> netlify.toml
echo. >> netlify.toml
echo # En-têtes pour tous les fichiers >> netlify.toml
echo [[headers]] >> netlify.toml
echo   for = "/*" >> netlify.toml
echo   [headers.values] >> netlify.toml
echo     X-Frame-Options = "DENY" >> netlify.toml
echo     X-XSS-Protection = "1; mode=block" >> netlify.toml
echo     X-Content-Type-Options = "nosniff" >> netlify.toml
echo     Referrer-Policy = "strict-origin-when-cross-origin" >> netlify.toml
echo     Permissions-Policy = "camera=(), microphone=(), geolocation=()" >> netlify.toml
echo     Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;" >> netlify.toml
echo. >> netlify.toml
echo # En-têtes spécifiques pour les fichiers JavaScript >> netlify.toml
echo [[headers]] >> netlify.toml
echo   for = "/*.js" >> netlify.toml
echo   [headers.values] >> netlify.toml
echo     Content-Type = "application/javascript; charset=utf-8" >> netlify.toml
echo     Cache-Control = "public, max-age=31536000, immutable" >> netlify.toml
echo. >> netlify.toml
echo # En-têtes spécifiques pour les fichiers CSS >> netlify.toml
echo [[headers]] >> netlify.toml
echo   for = "/*.css" >> netlify.toml
echo   [headers.values] >> netlify.toml
echo     Content-Type = "text/css; charset=utf-8" >> netlify.toml
echo     Cache-Control = "public, max-age=31536000, immutable" >> netlify.toml
echo. >> netlify.toml
echo # En-têtes pour les assets >> netlify.toml
echo [[headers]] >> netlify.toml
echo   for = "/assets/*" >> netlify.toml
echo   [headers.values] >> netlify.toml
echo     Cache-Control = "public, max-age=31536000, immutable" >> netlify.toml

echo [OK] Fichier netlify.toml créé.

echo [ETAPE 2/3] Détection de GitHub...

REM Vérifier si git est installé
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Git n'est pas installé ou n'est pas dans le PATH.
    echo              Vous devrez committer les changements manuellement.
    goto manual_instructions
)

REM Vérifier si le dossier est un dépôt git
if not exist ".git" (
    echo [ATTENTION] Ce dossier n'est pas un dépôt Git.
    echo              Vous devrez committer les changements manuellement.
    goto manual_instructions
)

echo [OK] Dépôt Git détecté.

REM Ajouter les fichiers au staging area
git add _headers _redirects netlify.toml

echo [OK] Fichiers ajoutés à l'index git.

REM Prompt pour le commit
echo.
echo [ETAPE 3/3] Création du commit et envoi vers GitHub...
set /p confirm=Voulez-vous créer un commit et l'envoyer vers GitHub maintenant? (O/N): 

if /i "%confirm%"=="O" (
    git commit -m "Fix: Configuration MIME types pour Netlify"
    
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Erreur lors de la création du commit.
        goto manual_instructions
    )
    
    git push
    
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Erreur lors de l'envoi vers GitHub.
        echo          Vous devrez pousser les changements manuellement.
        goto manual_instructions
    )
    
    echo [OK] Changements commités et envoyés vers GitHub avec succès!
    echo     Netlify devrait démarrer un nouveau déploiement automatiquement.
) else (
    echo [INFO] Commit annulé.
    goto manual_instructions
)

goto end

:manual_instructions
echo.
echo ===================================================
echo     INSTRUCTIONS MANUELLES
echo ===================================================
echo.
echo Pour envoyer ces modifications vers GitHub manuellement:
echo.
echo 1. Ouvrez GitHub Desktop
echo 2. Vous devriez voir les nouveaux fichiers dans la liste des changements
echo 3. Ajoutez un résumé comme "Fix: Configuration MIME types pour Netlify"
echo 4. Cliquez sur "Commit to main"
echo 5. Cliquez sur "Push origin" pour envoyer vers GitHub
echo.
echo Une fois ces étapes effectuées, Netlify devrait détecter les 
echo changements automatiquement et lancer un nouveau déploiement.
echo.

:end
echo.
echo ===================================================
echo     VÉRIFICATION FINALE
echo ===================================================
echo.
echo Les fichiers suivants ont été créés/modifiés:
echo  - _headers       (définit les types MIME corrects)
echo  - _redirects     (configure les redirections SPA)
echo  - netlify.toml   (configuration complète Netlify)
echo.
echo Pour vérifier le statut du déploiement:
echo 1. Allez sur app.netlify.com
echo 2. Sélectionnez votre site
echo 3. Allez dans l'onglet "Deploys"
echo.
echo Si un déploiement est en cours, attendez qu'il se termine.
echo Si aucun déploiement n'est visible, vous pouvez en déclencher
echo un manuellement depuis l'interface de Netlify.
echo.
pause
exit /b 0
