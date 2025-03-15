
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Résolution complète des problèmes Lovable

echo ===================================================
echo     RÉSOLUTION AVANCÉE DES PROBLÈMES LOVABLE
echo ===================================================
echo.
echo Cette solution avancée va résoudre les problèmes
echo d'intégration de Lovable en effectuant une série de 
echo vérifications et corrections.
echo.
echo [ÉTAPE 1/7] Vérification et restauration de index.html...
rem Vérifier index.html
if not exist "index.html" (
    if exist "index.html.backup" (
        echo [INFO] Restauration du fichier index.html à partir de la sauvegarde...
        copy /y index.html.backup index.html >nul
        echo [OK] Fichier index.html restauré avec succès.
    ) else (
        echo [ATTENTION] Aucune sauvegarde de index.html trouvée.
        echo [INFO] Création d'un nouveau fichier index.html...
        call fix-missing-index.bat
    )
) else (
    echo [OK] Le fichier index.html existe.
)
echo.

echo [ÉTAPE 2/7] Vérification du script Lovable dans index.html...
findstr "gptengineer.js" "index.html" >nul
if errorlevel 1 (
    echo [ATTENTION] Script Lovable manquant dans index.html.
    echo [INFO] Modification de index.html pour ajouter le script...
    
    powershell -Command "(Get-Content index.html) -replace '<head>', '<head>`n    <script src=\"https://cdn.gpteng.co/gptengineer.js\"></script>' | Set-Content index.html"
    
    echo [OK] Script Lovable ajouté à index.html.
) else (
    echo [OK] Script Lovable déjà présent dans index.html.
    
    findstr "<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\">" "index.html" >nul
    if errorlevel 0 (
        echo [ATTENTION] Le script Lovable a l'attribut type="module", suppression...
        powershell -Command "(Get-Content index.html) -replace '<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\">', '<script src=\"https://cdn.gpteng.co/gptengineer.js\">' | Set-Content index.html"
        echo [OK] Attribut type="module" supprimé.
    )
)
echo.

echo [ÉTAPE 3/7] Optimisation des utilitaires d'édition Lovable...
if exist "src\utils\lovable\editingUtils.ts" (
    echo [INFO] Vérification du fichier d'utilitaires d'édition Lovable...
    echo [OK] Le fichier d'utilitaires existe.
) else (
    echo [ATTENTION] Le fichier d'utilitaires d'édition Lovable est manquant!
    echo [INFO] Ce fichier sera créé lors de la construction.
)
echo.

echo [ÉTAPE 4/7] Nettoyage du cache et des fichiers temporaires...
echo [INFO] Suppression du répertoire dist...
if exist "dist" (
    rd /s /q dist
    echo [OK] Répertoire dist supprimé.
) else (
    echo [INFO] Répertoire dist inexistant, étape ignorée.
)

echo [INFO] Nettoyage du cache npm...
call npm cache clean --force
echo [OK] Cache npm nettoyé.
echo.

echo [ÉTAPE 5/7] Création d'un fichier .env.local pour le mode cloud...
echo [INFO] Configuration temporaire du mode cloud...
(
    echo VITE_CLOUD_MODE=true
    echo VITE_ALLOW_LOCAL_AI=false
) > .env.local
echo [OK] Fichier .env.local créé pour le mode cloud.
echo.

echo [ÉTAPE 6/7] Reconstruction complète...
set NODE_OPTIONS=--max-old-space-size=4096
echo [INFO] Reconstruction avec NODE_OPTIONS=--max-old-space-size=4096...
call npm run build
if errorlevel 1 (
    echo [ATTENTION] Échec de la reconstruction.
    echo [INFO] Tentative avec NO_RUST_INSTALL=1...
    set NO_RUST_INSTALL=1
    call npm run build
    if errorlevel 1 (
        echo [ERREUR] La reconstruction a échoué même avec NO_RUST_INSTALL=1.
        echo            Vérifiez les erreurs de compilation.
        pause
        exit /b 1
    )
)
echo [OK] Reconstruction réussie.
echo.

echo [ÉTAPE 7/7] Vérification finale et correction...
if exist "dist\index.html" (
    echo [INFO] Vérification de la présence du script Lovable dans dist\index.html...
    findstr "gptengineer.js" "dist\index.html" >nul
    if errorlevel 1 (
        echo [ATTENTION] Le script Lovable est absent de dist\index.html.
        echo [INFO] Copie manuelle de index.html vers dist\index.html...
        copy /y index.html dist\index.html >nul
        echo [OK] Correction appliquée.
    ) else (
        echo [OK] Le script Lovable est présent dans dist\index.html.
    )
) else (
    echo [ERREUR] Le fichier dist\index.html est manquant après la reconstruction!
    pause
    exit /b 1
)
echo.

echo ===================================================
echo     RÉSOLUTION AVANCÉE TERMINÉE
echo ===================================================
echo.
echo Pour finaliser et tester l'application:
echo 1. Redémarrez l'application avec 'npm run dev'
echo 2. Videz complètement le cache de votre navigateur
echo 3. Si les problèmes persistent, essayez un autre navigateur
echo    (Chrome ou Edge sont recommandés)
echo 4. Vous pouvez essayer le mode cloud en ajoutant
echo    ?cloud=true&mode=cloud à l'URL
echo.
pause
exit /b 0
