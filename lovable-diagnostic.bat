
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Lovable - Diagnostic d'intégration

echo ===================================================
echo     DIAGNOSTIC D'INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Cet outil va analyser l'intégration de Lovable dans
echo votre application et proposer des solutions.
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer l'analyse...
pause >nul

REM Vérification du script Lovable
echo [TEST 1/5] Vérification du script Lovable dans index.html...
if exist "index.html" (
    findstr "gptengineer.js" "index.html" >nul
    if !errorlevel! NEQ 0 (
        echo [ÉCHEC] Le script Lovable n'est pas présent dans index.html.
        set LOVABLE_SCRIPT_ISSUE=1
    ) else (
        echo [OK] Le script Lovable est présent dans index.html.
    )
) else (
    echo [ÉCHEC] Le fichier index.html est manquant.
    set LOVABLE_SCRIPT_ISSUE=1
)
echo.

REM Vérification du script dans le build
echo [TEST 2/5] Vérification du script Lovable dans le build (dist)...
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
echo [TEST 3/5] Vérification de la configuration du projet...
if exist ".env.local" (
    findstr "VITE_DISABLE_DEV_MODE=1" ".env.local" >nul
    if !errorlevel! NEQ 0 (
        echo [INFO] Mode développement activé, cela peut interférer avec Lovable.
        set ENV_ISSUE=1
    ) else (
        echo [OK] Configuration correcte.
    )
) else (
    echo [INFO] Fichier .env.local manquant, configuration par défaut utilisée.
)
echo.

REM Test de construction
echo [TEST 4/5] Test de construction rapide...
call npm run build --silent
if !errorlevel! NEQ 0 (
    echo [ÉCHEC] La construction du projet a échoué.
    set BUILD_ISSUE=1
) else (
    echo [OK] Construction réussie.
)
echo.

REM Vérification du navigateur (Chrome recommandé)
echo [TEST 5/5] Vérification du navigateur par défaut...
reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.html\UserChoice" /v "ProgId" 2>nul | findstr "ChromeHTML" >nul
if !errorlevel! NEQ 0 (
    echo [INFO] Chrome n'est pas votre navigateur par défaut.
    echo        Chrome ou Edge sont recommandés pour l'édition avec Lovable.
    set BROWSER_ISSUE=1
) else (
    echo [OK] Chrome est votre navigateur par défaut.
)
echo.

echo ===================================================
echo     RÉSULTATS DU DIAGNOSTIC
echo ===================================================
echo.

REM Afficher le résumé et les recommandations
set ISSUES_FOUND=0
if defined LOVABLE_SCRIPT_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Le script Lovable n'est pas correctement intégré.
    echo            Exécutez fix-edit-issues.bat pour corriger.
)
if defined LOVABLE_BUILD_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Le build ne contient pas le script Lovable.
    echo            Exécutez fix-edit-issues.bat puis reconstruisez.
)
if defined ENV_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Configuration environnement non optimale pour Lovable.
    echo            Ajoutez VITE_DISABLE_DEV_MODE=1 au fichier .env.local.
)
if defined BUILD_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Échec de la construction.
    echo            Vérifiez les messages d'erreur et corrigez les problèmes.
)
if defined BROWSER_ISSUE (
    set /a ISSUES_FOUND+=1
    echo [PROBLÈME] Navigateur non optimal pour l'édition avec Lovable.
    echo            Utilisez Google Chrome ou Microsoft Edge.
)

if %ISSUES_FOUND% EQU 0 (
    echo [RÉSULTAT] Aucun problème détecté avec l'intégration Lovable.
    echo            Si les problèmes persistent:
    echo            1. Videz le cache de votre navigateur
    echo            2. Désactivez les extensions qui pourraient interférer
    echo            3. Essayez un autre navigateur (Chrome ou Edge)
) else (
    echo [RÉSULTAT] %ISSUES_FOUND% problème(s) détecté(s).
    echo            Suivez les recommandations ci-dessus.
)
echo.

echo ===================================================
echo Pour corriger automatiquement les problèmes détectés,
echo exécutez: fix-edit-issues.bat
echo ===================================================
echo.
pause
exit /b 0
