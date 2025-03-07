
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Vérification Déploiement Netlify

echo =====================================================
echo       VÉRIFICATION DU DÉPLOIEMENT NETLIFY
echo =====================================================
echo.

REM Exécution du script de vérification JavaScript
echo [INFO] Vérification de la configuration Netlify...
node scripts\ensure-netlify-build.js

REM Vérification du build
if not exist "dist\" (
    echo [ATTENTION] Le dossier dist n'existe pas.
    echo [INFO] Lancement du build...
    
    REM Définir des variables d'environnement optimisées pour Netlify
    set "NODE_OPTIONS=--max-old-space-size=4096"
    set "NO_RUST_INSTALL=1"
    set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
    set "SKIP_PYTHON_INSTALLATION=true"
    
    call npm run build
    
    if errorlevel 1 (
        echo [ERREUR] Le build a échoué.
        exit /b 1
    ) else (
        echo [OK] Build réussi.
    )
) else (
    echo [INFO] Le dossier dist existe déjà.
)

REM Vérifier si les fichiers _redirects et _headers sont dans dist
if not exist "dist\_redirects" (
    echo [INFO] Copie de _redirects dans dist...
    copy _redirects dist\ 2>nul || echo /* /index.html 200 > dist\_redirects
)

if not exist "dist\_headers" (
    echo [INFO] Copie de _headers dans dist...
    copy _headers dist\ 2>nul || copy scripts\_headers dist\ 2>nul
)

REM Vérifier index.html pour les chemins absolus et le script Lovable
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    
    REM Vérification simplifiée pour Windows
    findstr "src=\"/" dist\index.html >nul
    if not errorlevel 1 (
        echo [ATTENTION] Chemins absolus détectés dans index.html.
        echo [INFO] La correction sera tentée lors du prochain build.
        echo [INFO] Ajoutez base: './' dans vite.config.ts si ce n'est pas déjà fait.
    ) else (
        echo [OK] Aucun chemin absolu détecté.
    )
    
    REM Vérification du script Lovable
    findstr "cdn.gpteng.co/gptengineer.js" dist\index.html >nul
    if errorlevel 1 (
        echo [ATTENTION] Script Lovable manquant dans index.html.
        echo [INFO] Le script sera ajouté lors du prochain build.
    ) else (
        echo [OK] Script Lovable présent.
    )
) else (
    echo [ERREUR] dist\index.html non trouvé!
    exit /b 1
)

echo.
echo =====================================================
echo       VÉRIFICATION TERMINÉE AVEC SUCCÈS
echo =====================================================
echo.
echo Votre application est prête à être déployée sur Netlify.
echo Assurez-vous de configurer les variables d'environnement
echo nécessaires dans l'interface Netlify.
echo.
pause
