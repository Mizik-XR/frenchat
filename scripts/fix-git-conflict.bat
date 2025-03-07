
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Résolution des conflits Git pour Netlify

echo ===================================================
echo     RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT
echo ===================================================
echo.

REM Vérifier si le fichier _redirects existe et s'il contient des marqueurs de conflit
if exist "scripts\_redirects" (
    findstr /C:"<<<<<<< HEAD" "scripts\_redirects" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [INFO] Conflit détecté dans scripts\_redirects, résolution en cours...
        
        REM Sauvegarder une copie du fichier original en conflit
        copy "scripts\_redirects" "scripts\_redirects.conflict" >nul
        
        REM Créer une nouvelle version propre du fichier
        echo # Redirection SPA - toutes les routes non existantes vers index.html > "scripts\_redirects"
        echo /*    /index.html   200 >> "scripts\_redirects"
        echo. >> "scripts\_redirects"
        echo # Redirection API vers les fonctions Netlify >> "scripts\_redirects"
        echo /api/*  /.netlify/functions/:splat  200 >> "scripts\_redirects"
        
        echo [OK] Fichier scripts\_redirects recréé avec le contenu correct.
    ) else (
        echo [INFO] Aucun marqueur de conflit trouvé dans scripts\_redirects.
    )
) else (
    echo [INFO] Le fichier scripts\_redirects n'existe pas, création...
    
    REM Créer le fichier
    echo # Redirection SPA - toutes les routes non existantes vers index.html > "scripts\_redirects"
    echo /*    /index.html   200 >> "scripts\_redirects"
    echo. >> "scripts\_redirects"
    echo # Redirection API vers les fonctions Netlify >> "scripts\_redirects"
    echo /api/*  /.netlify/functions/:splat  200 >> "scripts\_redirects"
    
    echo [OK] Fichier scripts\_redirects créé avec le contenu correct.
)

REM Gestion du conflit dans _redirects à la racine du projet
if exist "_redirects" (
    findstr /C:"<<<<<<< HEAD" "_redirects" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [INFO] Conflit détecté dans _redirects à la racine, résolution en cours...
        
        REM Sauvegarder une copie du fichier original en conflit
        copy "_redirects" "_redirects.conflict" >nul
        
        REM Créer une nouvelle version propre du fichier
        echo /*  /index.html  200 > "_redirects"
        
        echo [OK] Fichier _redirects recréé avec le contenu correct.
    ) else (
        echo [INFO] Aucun marqueur de conflit trouvé dans _redirects.
    )
) else (
    echo [INFO] Le fichier _redirects n'existe pas à la racine, création...
    
    REM Créer le fichier
    echo /*  /index.html  200 > "_redirects"
    
    echo [OK] Fichier _redirects créé avec le contenu correct.
)

echo.
echo [ÉTAPE SUIVANTE] Utilisation de Git pour résoudre le conflit...

REM Vérifier si git est disponible
where git >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    REM Marquer les fichiers comme résolus
    git add "_redirects" "scripts\_redirects" >nul 2>&1
    
    echo [OK] Fichiers marqués comme résolus dans Git.
    echo [INFO] Vous pouvez maintenant continuer le merge dans GitHub Desktop.
    echo        Cliquez sur "Continue merge" pour finaliser.
) else (
    echo [ATTENTION] Git n'est pas disponible en ligne de commande.
    echo             Veuillez ouvrir GitHub Desktop et:
    echo             1. Sélectionner les fichiers _redirects et scripts\_redirects
    echo             2. Choisir "Discard changes" puis les re-sélectionner
    echo             3. Cliquer sur "Continue merge"
)

echo.
echo ===================================================
echo     INSTRUCTIONS POUR FINALISER
echo ===================================================
echo.
echo 1. Retournez à GitHub Desktop
echo 2. Cliquez sur "Continue merge"
echo 3. Puis cliquez sur "Push origin"
echo.
echo Si "Continue merge" n'est pas disponible, essayez de
echo fermer et rouvrir GitHub Desktop.
echo.
pause
