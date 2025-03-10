
@echo off
setlocal enabledelayedexpansion

echo =====================================================
echo        VERIFICATION DU DEPLOIEMENT NETLIFY
echo =====================================================
echo.

:: Vérification du build
if not exist "dist\" (
    echo [ATTENTION] Le dossier dist n'existe pas.
    echo [INFO] Lancement du build...
    
    :: Définir des variables d'environnement optimisées pour Netlify
    set "NODE_OPTIONS=--max-old-space-size=4096"
    set "NO_RUST_INSTALL=1"
    set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
    set "SKIP_PYTHON_INSTALLATION=true"
    set "DEBUG=vite:*"
    set "NETLIFY_VERBOSE=true"
    
    call npm run build
    if !ERRORLEVEL! neq 0 (
        echo [ERREUR] Le build a échoué.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    
    echo [OK] Build réussi.
) else (
    echo [INFO] Le dossier dist existe déjà.
)

:: Vérifier si les fichiers _redirects et _headers sont dans dist
if not exist "dist\_redirects" (
    echo [INFO] Copie de _redirects dans dist...
    if exist "_redirects" (
        copy "_redirects" "dist\"
    ) else (
        echo /* /index.html 200 > "dist\_redirects"
        echo /diagnostic /diagnostic.html 200 >> "dist\_redirects"
        echo /image-diagnostic /image-diagnostic.html 200 >> "dist\_redirects"
    )
)

if not exist "dist\_headers" (
    echo [INFO] Copie de _headers dans dist...
    if exist "_headers" (
        copy "_headers" "dist\"
    ) else if exist "scripts\_headers" (
        copy "scripts\_headers" "dist\"
    ) else (
        echo [ATTENTION] Aucun fichier _headers trouvé, création d'un fichier _headers par défaut...
        echo /* > "dist\_headers"
        echo   X-Frame-Options: DENY >> "dist\_headers"
        echo   X-XSS-Protection: 1; mode=block >> "dist\_headers"
        echo   X-Content-Type-Options: nosniff >> "dist\_headers"
        echo   Content-Security-Policy: default-src 'self'; connect-src 'self' https://* http://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https: data:; >> "dist\_headers"
    )
)

:: Copier les pages de diagnostic
echo [INFO] Copie des fichiers de diagnostic...
if exist "public\diagnostic.html" (
    copy "public\diagnostic.html" "dist\"
    echo [OK] diagnostic.html copié.
)

if exist "public\image-diagnostic.html" (
    copy "public\image-diagnostic.html" "dist\"
    echo [OK] image-diagnostic.html copié.
)

if exist "public\debug.html" (
    copy "public\debug.html" "dist\"
    echo [OK] debug.html copié.
)

if exist "public\netlify-diagnostic.html" (
    copy "public\netlify-diagnostic.html" "dist\"
    echo [OK] netlify-diagnostic.html copié.
)

:: Copier les fichiers d'animation et images
if exist "public\filechat-animation.gif" (
    copy "public\filechat-animation.gif" "dist\"
    echo [OK] filechat-animation.gif copié.
)

:: Copier le SVG de placeholder personnalisé
if not exist "dist\assets" mkdir "dist\assets"
if exist "src\assets\custom-placeholder.svg" (
    copy "src\assets\custom-placeholder.svg" "dist\assets\"
    echo [OK] custom-placeholder.svg copié.
)

:: Vérifier index.html pour les chemins absolus
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    
    :: Créer un fichier temporaire pour les modifications
    type "dist\index.html" > "dist\index.html.tmp"
    
    :: Remplacer les chemins absolus par des chemins relatifs
    powershell -command "(Get-Content dist\index.html.tmp) -replace 'src=\"/', 'src=\"./' | Set-Content dist\index.html"
    powershell -command "(Get-Content dist\index.html) -replace 'href=\"/', 'href=\"./' | Set-Content dist\index.html.tmp"
    copy "dist\index.html.tmp" "dist\index.html" >nul
    
    :: Vérifier si Lovable est présent
    findstr /c:"cdn.gpteng.co/gptengineer.js" "dist\index.html" >nul
    if !ERRORLEVEL! neq 0 (
        echo [ATTENTION] Script Lovable manquant dans index.html.
        echo [INFO] Ajout du script Lovable...
        
        powershell -command "(Get-Content dist\index.html) -replace '</body>', '<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script></body>' | Set-Content dist\index.html.tmp"
        copy "dist\index.html.tmp" "dist\index.html" >nul
    )
    
    :: Ajouter du script React pour la page de diagnostic
    findstr /c:"unpkg.com/react@18" "dist\diagnostic.html" >nul 2>nul
    if !ERRORLEVEL! neq 0 (
        if exist "dist\diagnostic.html" (
            echo [INFO] Ajout des scripts React à diagnostic.html...
            powershell -command "(Get-Content dist\diagnostic.html) -replace '<head>', '<head>\n  <script crossorigin src=\"https://unpkg.com/react@18/umd/react.production.min.js\"></script>\n  <script crossorigin src=\"https://unpkg.com/react-dom@18/umd/react-dom.production.min.js\"></script>' | Set-Content dist\diagnostic.html"
        )
    )
    
    :: Supprimer le fichier temporaire
    if exist "dist\index.html.tmp" del "dist\index.html.tmp"
)

:: Vérifier et mettre à jour la politique CSP dans les fichiers HTML
echo [INFO] Vérification et mise à jour des politiques CSP...
for %%F in (dist\diagnostic.html dist\image-diagnostic.html) do (
    if exist "%%F" (
        echo [INFO] Mise à jour de la politique CSP dans %%F...
        powershell -command "$content = Get-Content '%%F' -Raw; $pattern = '<meta http-equiv=\"Content-Security-Policy\"'; if ($content -notmatch $pattern) { $content = $content -replace '<head>', '<head>\n  <meta http-equiv=\"Content-Security-Policy\" content=\"default-src ''self''; connect-src ''self'' https://* http://*; script-src ''self'' ''unsafe-inline'' ''unsafe-eval'' https://unpkg.com https://cdn.jsdelivr.net; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: blob: https:; font-src ''self'' https: data:;\">' }; $content | Set-Content '%%F'"
    )
)

echo.
echo =====================================================
echo        VERIFICATION TERMINEE AVEC SUCCES
echo =====================================================
echo.
echo Votre application est prête à être déployée sur Netlify.
echo Assurez-vous de configurer les variables d'environnement
echo nécessaires dans l'interface Netlify.
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
exit /b 0
