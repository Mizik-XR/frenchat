
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
        echo [INFO] Correction des chemins absolus...
        
        REM Utiliser PowerShell pour la substitution des chemins
        powershell -Command "(Get-Content dist\index.html) -replace 'src=\"/', 'src=\"./' | Set-Content dist\index.html"
        powershell -Command "(Get-Content dist\index.html) -replace 'href=\"/', 'href=\"./' | Set-Content dist\index.html"
        
        echo [OK] Chemins corrigés.
    ) else (
        echo [OK] Aucun chemin absolu détecté.
    )
    
    REM Vérification du script Lovable
    findstr "cdn.gpteng.co/gptengineer.js" dist\index.html >nul
    if errorlevel 1 (
        echo [ATTENTION] Script Lovable manquant dans index.html.
        echo [INFO] Ajout du script Lovable...
        
        REM Utiliser PowerShell pour ajouter le script
        powershell -Command "(Get-Content dist\index.html) -replace '</body>', '<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script></body>' | Set-Content dist\index.html"
        
        echo [OK] Script Lovable ajouté.
    ) else (
        echo [OK] Script Lovable présent.
    )
) else (
    echo [ERREUR] dist\index.html non trouvé!
    exit /b 1
)

REM Vérifier les fichiers JS pour des chemins absolus
if exist "dist\assets" (
    echo [INFO] Vérification des fichiers JS pour des chemins absolus...
    
    set "JS_FILES_WITH_ABSOLUTE_PATHS=0"
    
    for %%F in (dist\assets\*.js) do (
        findstr "from\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'from\"/', 'from\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
        
        findstr "import\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'import\"/', 'import\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
        
        findstr "fetch(\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'fetch\(\"/', 'fetch\(\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
    )
    
    if !JS_FILES_WITH_ABSOLUTE_PATHS! GTR 0 (
        echo [INFO] Corrigé des chemins absolus dans !JS_FILES_WITH_ABSOLUTE_PATHS! fichiers JS
    ) else (
        echo [OK] Aucun chemin absolu détecté dans les fichiers JS
    )
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
exit /b 0
