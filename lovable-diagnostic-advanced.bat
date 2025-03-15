
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Diagnostic Avancé Lovable

echo ===================================================
echo     DIAGNOSTIC AVANCÉ D'INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Cet outil va analyser en profondeur l'intégration de
echo Lovable dans votre application et proposer des solutions.
echo.
echo ===================================================
echo.
pause

REM Initialiser les variables pour le suivi des problèmes
set LOVABLE_SCRIPT_ISSUE=0
set LOVABLE_BUILD_ISSUE=0
set ENV_ISSUE=0
set BUILD_ISSUE=0
set BROWSER_ISSUE=0

REM Vérification du fichier index.html
echo [TEST 1/6] Vérification du fichier index.html...
if exist "index.html" (
    echo [OK] Le fichier index.html existe.
) else (
    echo [ERREUR] Le fichier index.html est manquant!
    set LOVABLE_SCRIPT_ISSUE=1
)
echo.

REM Vérification du script Lovable
echo [TEST 2/6] Vérification du script Lovable dans index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ÉCHEC] Le script Lovable n'est pas présent dans index.html.
        set LOVABLE_SCRIPT_ISSUE=1
    ) else (
        echo [OK] Le script Lovable est présent dans index.html.
        
        findstr "<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\">" "index.html" >nul
        if !errorlevel! EQU 0 (
            echo [ATTENTION] Le script Lovable a l'attribut type="module" qui peut causer des problèmes.
            set LOVABLE_SCRIPT_ISSUE=1
        )
    )
)
echo.

REM Vérification du script Lovable dans le build
echo [TEST 3/6] Vérification du script Lovable dans le build (dist)...
if exist "dist\index.html" (
    findstr "gptengineer.js" "dist\index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ÉCHEC] Le script Lovable n'est pas présent dans le build.
        set LOVABLE_BUILD_ISSUE=1
    ) else (
        echo [OK] Le script Lovable est présent dans le build.
    )
) else (
    echo [INFO] Le dossier dist n'existe pas encore. Un build est nécessaire.
    set LOVABLE_BUILD_ISSUE=1
)
echo.

REM Vérification des variables d'environnement
echo [TEST 4/6] Vérification de la configuration du projet...
if exist ".env.local" (
    findstr "VITE_CLOUD_MODE=true" ".env.local" >nul
    if !errorlevel! NEQ 0 (
        echo [INFO] Mode cloud non activé, cela peut aider avec les problèmes d'édition.
        set ENV_ISSUE=1
    ) else (
        echo [OK] Mode cloud activé, ce qui peut aider avec l'édition Lovable.
    )
) else (
    echo [INFO] Fichier .env.local manquant, mode cloud non activé.
    set ENV_ISSUE=1
)
echo.

REM Vérification du fichier main.tsx
echo [TEST 5/6] Vérification de l'initialisation de Lovable dans main.tsx...
if exist "src\main.tsx" (
    findstr "isLovableScriptLoaded" "src\main.tsx" >nul
    if !errorlevel! NEQ 0 (
        echo [INFO] Pas de code d'initialisation Lovable détecté dans main.tsx.
        set LOVABLE_SCRIPT_ISSUE=1
    ) else (
        echo [OK] Code d'initialisation Lovable détecté dans main.tsx.
    )
) else (
    echo [ERREUR] Le fichier src\main.tsx est manquant!
    set LOVABLE_SCRIPT_ISSUE=1
)
echo.

REM Rapport sur le navigateur
echo [TEST 6/6] Vérification du navigateur recommandé...
echo [INFO] Pour l'édition avec Lovable, Chrome ou Edge est recommandé.
echo [INFO] Si vous utilisez Firefox, Safari ou un autre navigateur,
echo        essayez de passer à Chrome ou Edge pour l'édition.
echo.

echo ===================================================
echo     RÉSULTATS DU DIAGNOSTIC
echo ===================================================
echo.

REM Afficher le résumé et les recommandations
set ISSUES_FOUND=0
if %LOVABLE_SCRIPT_ISSUE% EQU 1 (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Le script Lovable n'est pas correctement intégré.
    echo            Exécutez fix-lovable-issues-advanced.bat pour corriger.
)
if %LOVABLE_BUILD_ISSUE% EQU 1 (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Le build ne contient pas le script Lovable.
    echo            Exécutez fix-lovable-issues-advanced.bat puis reconstruisez.
)
if %ENV_ISSUE% EQU 1 (
    set /a ISSUES_FOUND+=1
    echo [SUGGESTION] Essayez le mode cloud pour améliorer l'édition Lovable.
    echo              Créez un fichier .env.local avec VITE_CLOUD_MODE=true.
)

if %ISSUES_FOUND% EQU 0 (
    echo [RÉSULTAT] Aucun problème majeur détecté avec l'intégration Lovable.
    echo            Si les problèmes persistent:
    echo            1. Videz le cache de votre navigateur
    echo            2. Désactivez les extensions qui pourraient interférer
    echo            3. Essayez un autre navigateur (Chrome ou Edge)
    echo            4. Essayez le mode cloud en ajoutant ?cloud=true à l'URL
) else (
    echo [RÉSULTAT] %ISSUES_FOUND% problème(s) détecté(s).
    echo            Suivez les recommandations ci-dessus.
    echo            Si les problèmes persistent après corrections:
    echo            1. Videz complètement le cache du navigateur
    echo            2. Utilisez le mode navigation privée
    echo            3. Essayez Chrome ou Edge si ce n'est pas déjà le cas
)
echo.

echo ===================================================
echo Pour corriger automatiquement les problèmes détectés,
echo exécutez: fix-lovable-issues-advanced.bat
echo ===================================================
echo.
pause
exit /b 0
