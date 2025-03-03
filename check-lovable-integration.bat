
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Vérification intégration Lovable

echo ===================================================
echo     VÉRIFICATION INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Ce script vérifie l'intégration du script Lovable (gptengineer.js)
echo et affiche les résultats du diagnostic.
echo.
echo ===================================================

echo.
echo [TEST 1/2] Vérification dans index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ÉCHEC] Le script gptengineer.js est absent de index.html.
        echo         Exécutez fix-edit-issues.bat pour corriger ce problème.
    ) else (
        echo [OK] Le script gptengineer.js est présent dans index.html.
        
        REM Vérifier la position du script
        findstr "<head>.*gptengineer.js.*</head>" "index.html" >nul
        if !errorlevel! NEQ 0 (
            echo [ATTENTION] Le script gptengineer.js pourrait ne pas être dans la section head.
            echo            Cela peut causer des problèmes d'édition.
        ) else (
            echo [OK] Position du script correcte dans le head.
        )
    )
) else (
    echo [ERREUR] Le fichier index.html est manquant.
)

echo.
echo [TEST 2/2] Vérification dans le build (dist)...
if exist "dist\index.html" (
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ÉCHEC] Le script gptengineer.js est absent du build.
        echo         Exécutez fix-edit-issues.bat pour corriger ce problème.
    ) else (
        echo [OK] Le script gptengineer.js est présent dans le build.
    )
) else (
    echo [INFO] Le dossier dist n'existe pas ou n'a pas encore été généré.
    echo        Exécutez npm run build pour générer le build.
)

echo.
echo ===================================================
echo     RECOMMANDATIONS
echo ===================================================
echo.
echo Si vous avez des problèmes d'édition avec Lovable:
echo.
echo 1. Exécutez fix-edit-issues.bat
echo 2. Effacez le cache de votre navigateur
echo 3. Utilisez Chrome ou Edge au lieu de Firefox
echo 4. Rechargez l'application
echo.
echo Pour effacer le cache dans Chrome:
echo - Appuyez sur Ctrl+Shift+Delete
echo - Cochez "Images et fichiers en cache"
echo - Cliquez sur "Effacer les données"
echo.
pause
exit /b 0
