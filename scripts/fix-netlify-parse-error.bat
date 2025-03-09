
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Correction des erreurs de parsing Netlify

echo ===================================================
echo     CORRECTION DES ERREURS DE PARSING NETLIFY
echo ===================================================
echo.
echo Ce script va corriger les erreurs communes dans le fichier netlify.toml
echo.

set "NETLIFY_FILE=netlify.toml"

rem Vérifier si le fichier existe
if not exist "%NETLIFY_FILE%" (
    echo [ERREUR] Fichier netlify.toml introuvable!
    pause
    exit /b 1
)

echo [INFO] Sauvegarde du fichier netlify.toml original...
copy /Y "%NETLIFY_FILE%" "%NETLIFY_FILE%.bak" >nul

echo [INFO] Analyse du fichier netlify.toml...

rem Rechercher des lignes problématiques
findstr /C:"Commande ECHO désactivée" "%NETLIFY_FILE%" >nul
if %ERRORLEVEL% EQU 0 (
    echo [ERREUR] Ligne problématique trouvée: 'Commande ECHO désactivée'
    echo [INFO] Création d'une version propre du fichier netlify.toml...
) else (
    echo [INFO] Aucune ligne "Commande ECHO désactivée" trouvée.
    echo [INFO] Création d'une version propre du fichier par précaution...
)

rem Réécrire proprement le fichier netlify.toml
echo # Configuration de build Netlify pour FileChat > "%NETLIFY_FILE%.clean"
echo [build] >> "%NETLIFY_FILE%.clean"
echo   publish = "dist" >> "%NETLIFY_FILE%.clean"
echo   command = "npm run build" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # Configuration des variables d'environnement par défaut >> "%NETLIFY_FILE%.clean"
echo [build.environment] >> "%NETLIFY_FILE%.clean"
echo   NODE_VERSION = "18" >> "%NETLIFY_FILE%.clean"
echo   NPM_FLAGS = "--prefer-offline --no-audit --no-fund" >> "%NETLIFY_FILE%.clean"
echo   NODE_OPTIONS = "--max-old-space-size=4096" >> "%NETLIFY_FILE%.clean"
echo   NO_RUST_INSTALL = "1" >> "%NETLIFY_FILE%.clean"
echo   NETLIFY_USE_YARN = "false" >> "%NETLIFY_FILE%.clean"
echo   TRANSFORMERS_OFFLINE = "1" >> "%NETLIFY_FILE%.clean"
echo   CI = "true" >> "%NETLIFY_FILE%.clean"
echo   SKIP_PYTHON_INSTALLATION = "true" >> "%NETLIFY_FILE%.clean"
echo   NETLIFY_SKIP_PYTHON_REQUIREMENTS = "true" >> "%NETLIFY_FILE%.clean"
echo   VITE_CLOUD_MODE = "true" >> "%NETLIFY_FILE%.clean"
echo   VITE_ALLOW_LOCAL_AI = "false" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # Configuration des redirections pour le routage SPA >> "%NETLIFY_FILE%.clean"
echo [[redirects]] >> "%NETLIFY_FILE%.clean"
echo   from = "/*" >> "%NETLIFY_FILE%.clean"
echo   to = "/index.html" >> "%NETLIFY_FILE%.clean"
echo   status = 200 >> "%NETLIFY_FILE%.clean"
echo   force = true >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # Rediriger les API vers les fonctions Netlify >> "%NETLIFY_FILE%.clean"
echo [[redirects]] >> "%NETLIFY_FILE%.clean"
echo   from = "/api/*" >> "%NETLIFY_FILE%.clean"
echo   to = "/.netlify/functions/:splat" >> "%NETLIFY_FILE%.clean"
echo   status = 200 >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # Configuration des fonctions Netlify >> "%NETLIFY_FILE%.clean"
echo [functions] >> "%NETLIFY_FILE%.clean"
echo   directory = "netlify/functions" >> "%NETLIFY_FILE%.clean"
echo   node_bundler = "esbuild" >> "%NETLIFY_FILE%.clean"
echo   included_files = ["**/*.model"] >> "%NETLIFY_FILE%.clean"
echo   external_node_modules = ["@supabase/supabase-js"] >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # En-têtes pour tous les fichiers >> "%NETLIFY_FILE%.clean"
echo [[headers]] >> "%NETLIFY_FILE%.clean"
echo   for = "/*" >> "%NETLIFY_FILE%.clean"
echo   [headers.values] >> "%NETLIFY_FILE%.clean"
echo     X-Frame-Options = "DENY" >> "%NETLIFY_FILE%.clean"
echo     X-XSS-Protection = "1; mode=block" >> "%NETLIFY_FILE%.clean"
echo     X-Content-Type-Options = "nosniff" >> "%NETLIFY_FILE%.clean"
echo     Referrer-Policy = "strict-origin-when-cross-origin" >> "%NETLIFY_FILE%.clean"
echo     Permissions-Policy = "camera=^(^), microphone=^(^), geolocation=^(^)" >> "%NETLIFY_FILE%.clean"
echo     Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://*.sentry-cdn.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https://fonts.gstatic.com https: data:;" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # En-têtes spécifiques pour les fichiers JavaScript >> "%NETLIFY_FILE%.clean"
echo [[headers]] >> "%NETLIFY_FILE%.clean"
echo   for = "/*.js" >> "%NETLIFY_FILE%.clean"
echo   [headers.values] >> "%NETLIFY_FILE%.clean"
echo     Content-Type = "application/javascript; charset=utf-8" >> "%NETLIFY_FILE%.clean"
echo     Cache-Control = "public, max-age=31536000, immutable" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # En-têtes spécifiques pour les fichiers CSS >> "%NETLIFY_FILE%.clean"
echo [[headers]] >> "%NETLIFY_FILE%.clean"
echo   for = "/*.css" >> "%NETLIFY_FILE%.clean"
echo   [headers.values] >> "%NETLIFY_FILE%.clean"
echo     Content-Type = "text/css; charset=utf-8" >> "%NETLIFY_FILE%.clean"
echo     Cache-Control = "public, max-age=31536000, immutable" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # En-têtes pour les assets >> "%NETLIFY_FILE%.clean"
echo [[headers]] >> "%NETLIFY_FILE%.clean"
echo   for = "/assets/*" >> "%NETLIFY_FILE%.clean"
echo   [headers.values] >> "%NETLIFY_FILE%.clean"
echo     Cache-Control = "public, max-age=31536000, immutable" >> "%NETLIFY_FILE%.clean"
echo. >> "%NETLIFY_FILE%.clean"
echo # Redirection pour la page de debug >> "%NETLIFY_FILE%.clean"
echo [[redirects]] >> "%NETLIFY_FILE%.clean"
echo   from = "/debug" >> "%NETLIFY_FILE%.clean"
echo   to = "/debug.html" >> "%NETLIFY_FILE%.clean"
echo   status = 200 >> "%NETLIFY_FILE%.clean"

echo [INFO] Remplacement du fichier netlify.toml par la version propre...
move /Y "%NETLIFY_FILE%.clean" "%NETLIFY_FILE%" >nul

echo [OK] Le fichier netlify.toml a été corrigé.
echo.
echo Si vous rencontrez toujours des problèmes après ce correctif,
echo vous pouvez restaurer le fichier de sauvegarde avec la commande:
echo move %NETLIFY_FILE%.bak %NETLIFY_FILE%
echo.

echo ===================================================
echo     CORRECTION TERMINÉE
echo ===================================================
pause
exit /b 0
