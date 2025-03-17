
@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo      DIAGNOSTIC ET RÉPARATION LOVABLE
echo ===================================================
echo.
echo Cet outil va diagnostiquer et résoudre automatiquement
echo les problèmes d'intégration Lovable dans l'application.
echo.

rem Créer un fichier de log
set LOG_FILE=lovable-fix.log
echo %date% %time%: Démarrage diagnostic Lovable > %LOG_FILE%

rem Vérification de l'intégration dans index.html
echo [ÉTAPE 1/5] Vérification de l'intégration Lovable dans index.html...
if exist "index.html" (
    echo - Fichier index.html trouvé >> %LOG_FILE%
    findstr /C:"gptengineer.js" "index.html" >nul
    if !errorlevel! equ 0 (
        echo - Script Lovable présent dans index.html >> %LOG_FILE%
        echo [✓] Le script Lovable est présent dans index.html
    ) else (
        echo [!] Script Lovable manquant dans index.html, correction...
        echo - Ajout du script Lovable à index.html >> %LOG_FILE%
        
        rem Sauvegarde de l'original
        copy index.html index.html.backup >nul
        
        rem Création d'un fichier temporaire pour l'édition
        type NUL > temp.html
        for /f "tokens=*" %%a in (index.html) do (
            echo %%a | findstr /C:"<script type=\"module\" src=\"/src/main.tsx\">" >nul
            if !errorlevel! equ 0 (
                echo     ^<!-- Script requis pour Lovable (Pick and Edit) --^> >> temp.html
                echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^> >> temp.html
                echo %%a >> temp.html
            ) else (
                echo %%a >> temp.html
            )
        )
        
        rem Remplacer l'original par le fichier édité
        move /y temp.html index.html >nul
        
        echo [✓] Script Lovable ajouté à index.html
    )
) else (
    echo [✗] ERREUR: index.html introuvable. Avez-vous lancé ce script depuis le répertoire racine?
    echo - index.html non trouvé >> %LOG_FILE%
    exit /b 1
)
echo.

rem Vérification du build
echo [ÉTAPE 2/5] Vérification du build...
if exist "dist" (
    echo - Dossier dist trouvé >> %LOG_FILE%
    if exist "dist\index.html" (
        echo - dist/index.html trouvé >> %LOG_FILE%
        findstr /C:"gptengineer.js" "dist\index.html" >nul
        if !errorlevel! equ 0 (
            echo [✓] Le script Lovable est présent dans le build
        ) else (
            echo [!] Script manquant dans le build, correction...
            echo - Ajout du script Lovable à dist/index.html >> %LOG_FILE%
            copy /y index.html dist\index.html >nul
            echo [✓] Script Lovable ajouté au build
        )
    ) else (
        echo [!] Le fichier dist\index.html n'existe pas, un nouveau build est nécessaire
        echo - dist/index.html non trouvé >> %LOG_FILE%
    )
) else (
    echo [!] Le dossier dist n'existe pas, un build est nécessaire
    echo - Dossier dist non trouvé >> %LOG_FILE%
)
echo.

rem Configuration pour le build
echo [ÉTAPE 3/5] Configuration de l'environnement...
echo - Configuration des variables d'environnement >> %LOG_FILE%

rem Vérifier si .env.local existe
if exist ".env.local" (
    rem Vérifier si VITE_DISABLE_DEV_MODE est déjà configuré
    findstr /C:"VITE_DISABLE_DEV_MODE=1" ".env.local" >nul
    if !errorlevel! neq 0 (
        echo VITE_DISABLE_DEV_MODE=1 >> .env.local
        echo [✓] VITE_DISABLE_DEV_MODE=1 ajouté à .env.local
    ) else (
        echo [✓] VITE_DISABLE_DEV_MODE est déjà configuré
    )
) else (
    rem Créer .env.local avec la configuration minimale requise
    (
        echo VITE_DISABLE_DEV_MODE=1
        echo VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
        echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
    ) > .env.local
    echo [✓] Fichier .env.local créé avec la configuration nécessaire
    echo - .env.local créé avec configuration Lovable >> %LOG_FILE%
)
echo.

rem Reconstruction de l'application
echo [ÉTAPE 4/5] Reconstruction de l'application...
echo - Démarrage du build >> %LOG_FILE%

rem Augmenter la mémoire disponible pour Node
set NODE_OPTIONS=--max-old-space-size=4096
echo - NODE_OPTIONS configuré pour 4GB >> %LOG_FILE%

rem Exécuter le build
call npm run build
if !errorlevel! equ 0 (
    echo [✓] Application reconstruite avec succès
    echo - Build réussi >> %LOG_FILE%
    
    rem Vérifier encore une fois le build pour s'assurer que le script Lovable est présent
    if exist "dist\index.html" (
        findstr /C:"gptengineer.js" "dist\index.html" >nul
        if !errorlevel! neq 0 (
            echo [!] Correction finale du build...
            copy /y index.html dist\index.html >nul
            echo - Correction manuelle du build final >> %LOG_FILE%
            echo [✓] Correction appliquée
        ) else (
            echo [✓] Vérification finale: script Lovable est présent dans le build
        )
    )
) else (
    echo [✗] ERREUR: La reconstruction a échoué
    echo - Échec du build >> %LOG_FILE%
)
echo.

rem Vérification du navigateur
echo [ÉTAPE 5/5] Recommandations pour le navigateur...
reg query "HKEY_CLASSES_ROOT\ChromeHTML" >nul 2>&1
if !errorlevel! equ 0 (
    echo [✓] Google Chrome est installé sur votre système
) else (
    reg query "HKEY_CLASSES_ROOT\MSEdgeHTM" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [✓] Microsoft Edge est installé sur votre système
    ) else (
        echo [!] Recommandation: Installez Google Chrome ou Microsoft Edge pour Lovable
    )
)
echo - Vérification du navigateur terminée >> %LOG_FILE%
echo.

echo ===================================================
echo      RÉPARATION TERMINÉE
echo ===================================================
echo.
echo Si vous étiez en train d'utiliser l'application:
echo 1. Redémarrez l'application
echo 2. Videz le cache de votre navigateur ou utilisez le mode incognito
echo 3. Si le problème persiste, utilisez Chrome ou Edge
echo.
echo Journal de diagnostic sauvegardé dans: %LOG_FILE%
echo.
pause
exit /b 0
