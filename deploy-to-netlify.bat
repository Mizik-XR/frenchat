
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Frenchat - Déploiement vers Netlify

echo ===================================================
echo     DÉPLOIEMENT FRENCHAT VERS NETLIFY
echo ===================================================
echo.
echo Ce script va déployer Frenchat vers Netlify.
echo Assurez-vous d'avoir installé la CLI Netlify et
echo d'être connecté à votre compte Netlify.
echo.
echo Étapes:
echo 1. Vérification de l'environnement
echo 2. Préparation du build pour déploiement
echo 3. Déploiement vers Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Vérifier si netlify CLI est installé
echo [ÉTAPE 1/3] Vérification de l'environnement...
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Netlify CLI n'est pas installé, installation en cours...
    call npm install -g netlify-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation de la CLI Netlify a échoué.
        echo.
        echo Tentative avec npx...
        set USE_NPX=1
    ) else (
        echo [OK] CLI Netlify installée avec succès.
        set USE_NPX=0
    )
) else (
    echo [OK] CLI Netlify est déjà installé.
    set USE_NPX=0
)

REM Vérifier les outils nécessaires
echo [INFO] Vérification des outils de construction...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] npx n'est pas disponible, installation en cours...
    call npm install -g npx
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] Installation de npx échouée, mais on peut continuer avec npm.
    )
)

REM Vérifier si le dossier dist existe déjà
echo [INFO] Vérification du dossier dist...
if not exist "dist\" (
    echo [ATTENTION] Le dossier dist n'existe pas. Il sera créé lors de la construction.
) else (
    echo [OK] Le dossier dist existe.
    
    REM Vérifier si le dossier contient des fichiers
    dir /b "dist\" | findstr "." >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] Le dossier dist est vide. Un nouveau build sera effectué.
    ) else (
        echo [OK] Le dossier dist contient des fichiers.
    )
)

REM Préparer le build
echo [ÉTAPE 2/3] Préparation du build pour déploiement...
echo [INFO] Nettoyage des fichiers temporaires...
if exist "dist\" (
    REM On garde une sauvegarde du dist au cas où
    if not exist "dist_backup\" (
        mkdir dist_backup 2>nul
    ) else (
        rmdir /s /q dist_backup
        mkdir dist_backup
    )
    xcopy /E /I /Y "dist\*" "dist_backup\" >nul 2>nul
    echo [OK] Sauvegarde du dossier dist créée dans dist_backup.
)

echo [INFO] Configuration de l'environnement de build...
set NODE_OPTIONS=--max-old-space-size=4096
set NO_RUST_INSTALL=1

echo [INFO] Construction du projet en cours...
echo [INFO] Cette étape peut prendre plusieurs minutes...

REM Vérifier si package.json existe
if not exist "package.json" (
    echo [ERREUR] Fichier package.json introuvable.
    echo.
    echo Vérifiez que vous êtes dans le bon répertoire.
    echo.
    pause
    exit /b 1
)

REM Vérifier le script de build dans package.json
findstr "\"build\":" "package.json" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Script de build non trouvé dans package.json.
    echo.
    echo Vérifiez que votre package.json contient une commande de build.
    echo.
    pause
    exit /b 1
)

REM Tenter la construction avec npm run build
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La construction avec npm run build a échoué.
    echo.
    echo Tentative avec npx vite build...
    call npx vite build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] La construction du projet a échoué.
        echo.
        echo Options de récupération:
        echo 1. Restaurer la sauvegarde du dossier dist
        echo 2. Tenter une construction avec des options simplifiées
        echo 3. Quitter
        choice /C 123 /N /M "Choisissez une option (1, 2 ou 3): "
        
        if %ERRORLEVEL% EQU 1 (
            echo [INFO] Restauration de la sauvegarde du dossier dist...
            if exist "dist_backup\" (
                rmdir /s /q "dist" 2>nul
                mkdir "dist" 2>nul
                xcopy /E /I /Y "dist_backup\*" "dist\" >nul
                echo [OK] Sauvegarde restaurée.
            ) else (
                echo [ERREUR] Aucune sauvegarde disponible.
                echo.
                echo Appuyez sur une touche pour quitter...
                pause >nul
                exit /b 1
            )
        ) else if %ERRORLEVEL% EQU 2 (
            echo [INFO] Tentative de construction avec options simplifiées...
            set NODE_OPTIONS=--max-old-space-size=4096
            set NO_RUST_INSTALL=1
            set VITE_DISABLE_DEV_MODE=1
            call npx vite build --force
            if %ERRORLEVEL% NEQ 0 (
                echo [ERREUR] La construction a échoué même avec les options simplifiées.
                echo.
                echo Appuyez sur une touche pour quitter...
                pause >nul
                exit /b 1
            )
        ) else (
            echo.
            echo Appuyez sur une touche pour quitter...
            pause >nul
            exit /b 1
        )
    )
)

REM Vérifier le contenu du dossier dist après la construction
echo [INFO] Vérification du contenu du dossier dist...
if not exist "dist\index.html" (
    echo [ERREUR] Le fichier dist\index.html est manquant.
    echo          La construction n'a pas produit un dossier dist valide.
    echo.
    echo Options de récupération:
    echo 1. Restaurer la sauvegarde du dossier dist
    echo 2. Utiliser fix-blank-page.bat pour tenter une réparation
    echo 3. Quitter
    choice /C 123 /N /M "Choisissez une option (1, 2 ou 3): "
    
    if %ERRORLEVEL% EQU 1 (
        echo [INFO] Restauration de la sauvegarde du dossier dist...
        if exist "dist_backup\" (
            rmdir /s /q "dist" 2>nul
            mkdir "dist" 2>nul
            xcopy /E /I /Y "dist_backup\*" "dist\" >nul
            echo [OK] Sauvegarde restaurée.
        ) else (
            echo [ERREUR] Aucune sauvegarde disponible.
            echo.
            echo Appuyez sur une touche pour quitter...
            pause >nul
            exit /b 1
        )
    ) else if %ERRORLEVEL% EQU 2 (
        echo [INFO] Tentative de réparation avec fix-blank-page.bat...
        call fix-blank-page.bat
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] La réparation a échoué.
            echo.
            echo Appuyez sur une touche pour quitter...
            pause >nul
            exit /b 1
        )
    ) else (
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Vérifier que le script Lovable est bien présent
echo [INFO] Vérification du script Lovable...
findstr /c:"gptengineer.js" "dist\index.html" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html, correction en cours...
    call fix-blank-page.bat >nul 2>nul
    echo [OK] Correction appliquée.
)

echo [OK] Build prêt pour déploiement.
echo.

REM Vérifier la connexion à Netlify
echo [ÉTAPE 3/3] Préparation du déploiement vers Netlify...
if "%USE_NPX%"=="1" (
    echo [INFO] Utilisation de npx pour la CLI Netlify...
    npx netlify status 2>nul
) else (
    netlify status 2>nul
)

if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Vous n'êtes pas connecté à Netlify.
    echo [INFO] Connexion à Netlify...
    if "%USE_NPX%"=="1" (
        npx netlify login
    ) else (
        netlify login
    )
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de la connexion à Netlify.
        echo.
        echo Alternatives:
        echo 1. Déployer manuellement le dossier 'dist' via l'interface Netlify
        echo 2. Connecter votre dépôt GitHub à Netlify
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connecté à Netlify.
echo.

REM Déployer vers Netlify
echo [INFO] Configuration du déploiement...
echo.
echo [INFO] Options de déploiement:
echo 1. Déployer une prévisualisation (preview)
echo 2. Déployer en production
echo 3. Annuler le déploiement
choice /C 123 /N /M "Choisissez une option (1, 2 ou 3): "

if %ERRORLEVEL% EQU 3 (
    echo.
    echo Déploiement annulé par l'utilisateur.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 0
)

set DEPLOY_TYPE=preview
if %ERRORLEVEL% EQU 2 (
    echo [INFO] Déploiement en production...
    set DEPLOY_TYPE=production
) else (
    echo [INFO] Déploiement d'une prévisualisation...
)

REM Exécution du déploiement
echo [INFO] Déploiement en cours... (Ne fermez pas cette fenêtre)
echo [INFO] Cette étape peut prendre plusieurs minutes...

if "%DEPLOY_TYPE%"=="production" (
    if "%USE_NPX%"=="1" (
        npx netlify deploy --prod --dir=dist
    ) else (
        netlify deploy --prod --dir=dist
    )
) else (
    if "%USE_NPX%"=="1" (
        npx netlify deploy --dir=dist
    ) else (
        netlify deploy --dir=dist
    )
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Le déploiement a échoué.
    echo.
    echo Options:
    echo 1. Réessayer le déploiement (parfois les problèmes sont temporaires)
    echo 2. Déployer manuellement via l'interface Netlify (glisser-déposer le dossier dist)
    echo 3. Quitter
    choice /C 123 /N /M "Choisissez une option (1, 2 ou 3): "
    
    if %ERRORLEVEL% EQU 1 (
        echo [INFO] Nouvelle tentative de déploiement...
        if "%DEPLOY_TYPE%"=="production" (
            if "%USE_NPX%"=="1" (
                npx netlify deploy --prod --dir=dist
            ) else (
                netlify deploy --prod --dir=dist
            )
        ) else (
            if "%USE_NPX%"=="1" (
                npx netlify deploy --dir=dist
            ) else (
                netlify deploy --dir=dist
            )
        }
        
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] Le déploiement a échoué à nouveau.
            echo.
            echo Appuyez sur une touche pour quitter...
            pause >nul
            exit /b 1
        )
    ) else if %ERRORLEVEL% EQU 2 (
        echo.
        echo [INFO] Pour déployer manuellement:
        echo 1. Ouvrez https://app.netlify.com dans votre navigateur
        echo 2. Connectez-vous à votre compte
        echo 3. Glissez-déposez le dossier 'dist' dans l'interface
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 0
    ) else (
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Déploiement terminé avec succès.
echo.

echo ===================================================
echo     DÉPLOIEMENT TERMINÉ
echo ===================================================
echo.
echo Le site a été déployé avec succès sur Netlify!
echo.
echo N'oubliez pas de configurer les variables d'environnement
echo dans l'interface Netlify pour les fonctionnalités avancées.
echo.
echo Variables à configurer:
echo - VITE_SUPABASE_URL: URL de votre projet Supabase
echo - VITE_SUPABASE_ANON_KEY: Clé anonyme de votre projet Supabase
echo - VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)
echo.
echo Pour accéder à ces paramètres:
echo 1. Ouvrez le site déployé sur Netlify
echo 2. Allez dans Site settings -^> Build ^& deploy -^> Environment
echo.
echo ===================================================
echo.
echo Vous pouvez maintenant partager le lien de déploiement!
echo.
pause
exit /b 0
