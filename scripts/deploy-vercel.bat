
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Deploiement vers Vercel

echo ===================================================
echo     DEPLOIEMENT FILECHAT VERS VERCEL
echo ===================================================
echo.
echo Ce script va deployer FileChat vers Vercel.
echo Assurez-vous d'avoir installe la CLI Vercel et
echo d'etre connecte a votre compte Vercel.
echo.
echo Etapes:
echo 1. Verification de l'environnement
echo 2. Preparation du build pour deploiement
echo 3. Configuration des headers MIME
echo 4. Connexion a Vercel
echo 5. Deploiement vers Vercel
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Verifier si vercel CLI est installe
where vercel >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Vercel CLI n'est pas configure, installation en cours...
    call npm install -g vercel
    
    REM Verifier si l'installation a reussi
    where vercel >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [ATTENTION] L'installation automatique a echoue, tentative avec --force...
        call npm install -g vercel --force
        
        REM Verifier a nouveau
        where vercel >nul 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [ERREUR] Installation de Vercel CLI impossible.
            echo.
            echo Vous pouvez essayer manuellement avec:
            echo npm install -g vercel
            echo ou
            echo yarn global add vercel
            echo.
            
            echo Voulez-vous continuer avec npx vercel ? (O/N)
            choice /C ON /N /M "Choix: "
            if !ERRORLEVEL! NEQ 1 (
                echo Deploiement annule.
                exit /b 1
            )
            set "VERCEL_CMD=npx vercel"
        ) else (
            echo [OK] Vercel CLI installe avec succes (methode alternative).
            set "VERCEL_CMD=vercel"
        )
    ) else (
        echo [OK] CLI Vercel installee avec succes.
        set "VERCEL_CMD=vercel"
    )
) else (
    echo [OK] CLI Vercel deja installee.
    set "VERCEL_CMD=vercel"
)

REM Configuration pour le deploiement
set "NODE_ENV=production"
set "VITE_CLOUD_MODE=true"
set "VITE_ALLOW_LOCAL_AI=false"
set "SKIP_PYTHON_INSTALLATION=true"

REM Nettoyer les fichiers inutiles
echo [INFO] Nettoyage des fichiers temporaires...
if exist "dist\" rmdir /s /q dist

REM Installation optimisee pour Vercel
echo [INFO] Installation des dependances avec configuration pour Vercel...
call npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

REM Preparer le build
echo [ETAPE 2/5] Preparation du build pour deploiement...
set "NODE_OPTIONS=--max-old-space-size=4096"
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo [ERREUR] La construction du projet a echoue.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Build pret pour deploiement.
echo.

REM Configurer les headers Vercel pour les types MIME
echo [ETAPE 3/5] Configuration des headers pour types MIME...
node scripts/vercel-headers.js
if !ERRORLEVEL! NEQ 0 (
    echo [ATTENTION] La configuration des headers a echoue, mais le deploiement continue.
)

REM Verifier la connexion a Vercel
echo [ETAPE 4/5] Verification de la connexion a Vercel...
%VERCEL_CMD% whoami >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] Vous n'etes pas connecte a Vercel.
    echo [INFO] Connexion a Vercel...
    %VERCEL_CMD% login
    if !ERRORLEVEL! NEQ 0 (
        echo [ERREUR] Echec de la connexion a Vercel.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)
echo [OK] Connecte a Vercel.
echo.

REM Deployer vers Vercel
echo [ETAPE 5/5] Voulez-vous:
echo 1. Deployer une previsualisation
echo 2. Deployer en production
choice /C 12 /N /M "Choisissez une option (1 ou 2): "

if !ERRORLEVEL! EQU 1 (
    echo [INFO] Deploiement d'une previsualisation...
    %VERCEL_CMD%
) else (
    echo [INFO] Deploiement en production...
    %VERCEL_CMD% --prod
)

if !ERRORLEVEL! NEQ 0 (
    echo [ERREUR] Le deploiement a echoue.
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)
echo [OK] Deploiement termine avec succes.
echo.

echo ===================================================
echo     DEPLOIEMENT TERMINE
echo ===================================================
echo.
echo N'oubliez pas de configurer les variables d'environnement
echo dans l'interface Vercel pour les fonctionnalites avancees.
echo.
echo Variables a configurer:
echo - VITE_SUPABASE_URL: URL de votre projet Supabase
echo - VITE_SUPABASE_ANON_KEY: Cle anonyme de votre projet Supabase
echo - VITE_CLOUD_API_URL: URL de l'API cloud (optionnel)
echo.
echo ===================================================
echo.
echo Vous pouvez maintenant partager le lien de deploiement avec le client.
echo.
pause
exit /b 0
