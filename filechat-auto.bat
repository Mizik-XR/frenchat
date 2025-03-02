
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Assistant Automatique

REM Configuration des couleurs pour une meilleure lisibilité
color 1F
mode con cols=120 lines=35

:MENU_PRINCIPAL
cls
echo ===================================================
echo      ASSISTANT AUTOMATIQUE FILECHAT v1.0
echo ===================================================
echo.
echo Ce script va automatiser toutes les opérations nécessaires
echo au fonctionnement optimal de FileChat en local.
echo.
echo [1] Nettoyage et Configuration Complète (recommandé)
echo [2] Démarrage Rapide (si déjà configuré)
echo [3] Mode de Secours (en cas de problème)
echo [4] Diagnostics et Résolution Automatique
echo [5] Aide et Documentation
echo [0] Quitter
echo.
echo ===================================================
echo.
set /p CHOIX="Votre choix: "

if "%CHOIX%"=="1" goto NETTOYAGE_COMPLET
if "%CHOIX%"=="2" goto DEMARRAGE_RAPIDE
if "%CHOIX%"=="3" goto MODE_SECOURS
if "%CHOIX%"=="4" goto DIAGNOSTICS
if "%CHOIX%"=="5" goto AIDE
if "%CHOIX%"=="0" goto FIN
goto MENU_PRINCIPAL

:NETTOYAGE_COMPLET
cls
echo ===================================================
echo      NETTOYAGE ET CONFIGURATION COMPLÈTE
echo ===================================================
echo.
echo Étapes à effectuer :
echo [1] Vérification de l'environnement
echo [2] Nettoyage des caches et dossiers temporaires
echo [3] Réinstallation des dépendances
echo [4] Construction de l'application
echo [5] Configuration optimale pour votre système
echo.
echo Cette opération peut prendre plusieurs minutes.
echo.
set /p CONFIRM="Voulez-vous continuer? [O/N]: "
if /i not "%CONFIRM%"=="O" goto MENU_PRINCIPAL

REM Vérification de l'environnement
echo.
echo [1/5] Vérification de l'environnement...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans votre PATH.
    echo          Veuillez installer Node.js depuis https://nodejs.org/
    pause
    goto MENU_PRINCIPAL
) else (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo [OK] Node.js !NODE_VERSION! détecté
)

REM Analyse du système
echo.
echo [INFO] Analyse de votre système...
for /f "tokens=*" %%a in ('wmic cpu get name ^| findstr /v "Name"') do set CPU_INFO=%%a
for /f "tokens=*" %%a in ('wmic memorychip get capacity ^| findstr /v "Capacity"') do set /a MEMORY_GB=%%a/1073741824
for /f "tokens=*" %%a in ('wmic path win32_VideoController get name ^| findstr /v "Name"') do set GPU_INFO=%%a
echo [INFO] CPU: !CPU_INFO!
echo [INFO] RAM: !MEMORY_GB! GB
echo [INFO] GPU: !GPU_INFO!

REM Définir les options en fonction du matériel
set "USE_GPU=0"
echo !GPU_INFO! | findstr /i "NVIDIA RTX GTX" >nul
if %ERRORLEVEL% EQU 0 set "USE_GPU=1"
if !MEMORY_GB! GEQ 16 (
    set "HIGH_MEMORY=1"
) else (
    set "HIGH_MEMORY=0"
)

REM Nettoyage des dossiers
echo.
echo [2/5] Nettoyage des caches et dossiers temporaires...
if exist "node_modules\" (
    echo [INFO] Suppression de node_modules...
    rmdir /s /q node_modules
)
if exist "dist\" (
    echo [INFO] Suppression de dist...
    rmdir /s /q dist
)
if exist ".vite\" (
    echo [INFO] Suppression du cache Vite...
    rmdir /s /q .vite
)
if exist ".netlify\" (
    echo [INFO] Suppression du cache Netlify...
    rmdir /s /q .netlify
)
call npm cache clean --force
echo [OK] Nettoyage terminé

REM Réinstallation des dépendances
echo.
echo [3/5] Réinstallation des dépendances...
set NODE_OPTIONS=--max-old-space-size=4096
if !HIGH_MEMORY! EQU 1 set NODE_OPTIONS=--max-old-space-size=8192
echo [INFO] Installation avec NODE_OPTIONS=!NODE_OPTIONS!
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Installation des dépendances échouée
    echo [INFO] Tentative avec des options alternatives...
    set NO_RUST_INSTALL=1
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation a échoué même avec des options alternatives
        pause
        goto MENU_PRINCIPAL
    )
)
echo [OK] Dépendances installées avec succès

REM Construction de l'application
echo.
echo [4/5] Construction de l'application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Construction échouée
    echo [INFO] Tentative de correction automatique...
    
    REM Vérifier si le problème est lié au noscript
    findstr /C:"disallowed-content-in-noscript-in-head" build-log.txt >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Correction du problème de noscript dans index.html...
        powershell -Command "(Get-Content index.html) -replace '<head>([\\s\\S]*)<noscript>([\\s\\S]*)</noscript>([\\s\\S]*)</head>', '<head>`$1</head><body><noscript>`$2</noscript>' | Set-Content index.html.fixed"
        move /y index.html.fixed index.html
        call npm run build
    )
    
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] La construction a échoué malgré les tentatives de correction
        echo [INFO] Essayez le Mode de Secours depuis le menu principal
        pause
        goto MENU_PRINCIPAL
    )
)
echo [OK] Application construite avec succès

REM Configuration optimale
echo.
echo [5/5] Configuration optimale pour votre système...
(
    echo VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
    echo VITE_API_URL=http://localhost:8000
    echo VITE_ENVIRONMENT=development
    echo VITE_SITE_URL=http://localhost:8080
    if !USE_GPU! EQU 1 (
        echo VITE_USE_GPU=true
        echo VITE_ENABLE_HARDWARE_ACCELERATION=true
    )
    if !HIGH_MEMORY! EQU 1 (
        echo VITE_HIGH_MEMORY=true
    )
) > .env.local
echo [OK] Configuration terminée

REM Vérification script gptengineer.js
echo.
echo [INFO] Vérification du script Lovable...
findstr "gptengineer.js" "dist\index.html" >nul
if !errorlevel! NEQ 0 (
    echo [ATTENTION] Le script Lovable manque dans index.html.
    echo [INFO] Application d'une correction automatique...
    (for /f "delims=" %%i in (dist\index.html) do (
        echo %%i | findstr "<script " >nul
        if !errorlevel! EQU 0 (
            echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
        )
        echo %%i
    )) > dist\index.html.temp
    move /y dist\index.html.temp dist\index.html >nul
    echo [OK] Script Lovable ajouté.
)

echo.
echo ===================================================
echo    NETTOYAGE ET CONFIGURATION TERMINÉS AVEC SUCCÈS
echo ===================================================
echo.
echo Sélectionnez une option pour continuer:
echo [1] Démarrer FileChat maintenant
echo [2] Retourner au menu principal
echo.
set /p NEXT_STEP="Votre choix: "

if "%NEXT_STEP%"=="1" goto DEMARRAGE_RAPIDE
goto MENU_PRINCIPAL

:DEMARRAGE_RAPIDE
cls
echo ===================================================
echo         DÉMARRAGE RAPIDE DE FILECHAT
echo ===================================================
echo.
echo Options de démarrage:
echo [1] Mode standard avec IA locale (si disponible)
echo [2] Mode cloud uniquement (plus léger)
echo [3] Mode développeur (avec logs détaillés)
echo [0] Retour au menu principal
echo.
set /p START_MODE="Votre choix: "

if "%START_MODE%"=="0" goto MENU_PRINCIPAL
if "%START_MODE%"=="1" goto START_STANDARD
if "%START_MODE%"=="2" goto START_CLOUD
if "%START_MODE%"=="3" goto START_DEV

:START_STANDARD
echo.
echo [INFO] Démarrage de FileChat en mode standard...

REM Vérifier si Ollama est disponible
set "OLLAMA_AVAILABLE=0"
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 set "OLLAMA_AVAILABLE=1"

REM Vérifier si le dossier dist existe
if not exist "dist\" (
    echo [INFO] Le dossier dist n'existe pas, construction de l'application...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction échouée
        echo [INFO] Tentative de démarrage en mode de secours...
        call start-fallback-mode.bat
        exit /b 0
    )
)

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
)

echo.
echo [INFO] Démarrage des services...

REM Démarrage du serveur IA si Ollama est disponible
if "%OLLAMA_AVAILABLE%"=="1" (
    echo [INFO] Ollama détecté, activation de l'IA locale...
    if exist "serve_model.py" (
        start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"
        timeout /t 3 /nobreak > nul
    ) else (
        echo [ATTENTION] Fichier serve_model.py non trouvé, IA locale désactivée
    )
)

REM Démarrage du serveur web
start "Application Web FileChat" cmd /c "http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
start http://localhost:8080

echo.
echo ===================================================
echo    FILECHAT DÉMARRÉ AVEC SUCCÈS
echo ===================================================
echo.
echo Services actifs:
if "%OLLAMA_AVAILABLE%"=="1" echo [IA] Serveur IA local - http://localhost:8000
echo [WEB] Application web - http://localhost:8080
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas
echo tant que vous utilisez FileChat.
echo.
echo Appuyez sur une touche pour retourner au menu principal...
pause >nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat" >nul 2>nul
if "%OLLAMA_AVAILABLE%"=="1" taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local" >nul 2>nul
goto MENU_PRINCIPAL

:START_CLOUD
echo.
echo [INFO] Démarrage de FileChat en mode cloud...
set "MODE_CLOUD=1"

REM Vérifier si le dossier dist existe
if not exist "dist\" (
    echo [INFO] Le dossier dist n'existe pas, construction de l'application...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction échouée
        echo [INFO] Tentative de démarrage en mode de secours...
        call start-fallback-mode.bat
        exit /b 0
    )
)

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
)

echo.
echo [INFO] Démarrage du serveur web...
start "Application Web FileChat" cmd /c "http-server dist -p 8080 -c-1 --cors"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
start http://localhost:8080?mode=cloud

echo.
echo ===================================================
echo    FILECHAT DÉMARRÉ EN MODE CLOUD AVEC SUCCÈS
echo ===================================================
echo.
echo Services actifs:
echo [WEB] Application web - http://localhost:8080?mode=cloud
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas
echo tant que vous utilisez FileChat.
echo.
echo Appuyez sur une touche pour retourner au menu principal...
pause >nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat" >nul 2>nul
goto MENU_PRINCIPAL

:START_DEV
echo.
echo [INFO] Démarrage de FileChat en mode développeur...
set "VITE_DEBUG_MODE=1"
set "DEV_MODE=1"

REM Vérifier si le dossier dist existe
if not exist "dist\" (
    echo [INFO] Le dossier dist n'existe pas, construction de l'application...
    set NODE_OPTIONS=--max-old-space-size=4096
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction échouée
        echo [INFO] Tentative de démarrage en mode de secours...
        call start-fallback-mode.bat
        exit /b 0
    )
)

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
)

REM Démarrage des serveurs en mode développeur
echo.
echo [INFO] Démarrage des services en mode développeur...

REM Vérifier si Ollama est disponible
set "OLLAMA_AVAILABLE=0"
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 set "OLLAMA_AVAILABLE=1"

REM Démarrage du serveur IA si disponible
if "%OLLAMA_AVAILABLE%"=="1" (
    echo [INFO] Ollama détecté, activation de l'IA locale...
    if exist "serve_model.py" (
        start "Serveur IA Local (DEV)" cmd /c "set DEBUG=true && venv\Scripts\python.exe serve_model.py"
        timeout /t 3 /nobreak > nul
    ) else (
        echo [ATTENTION] Fichier serve_model.py non trouvé, IA locale désactivée
    )
)

REM Démarrage du serveur web avec logs complets
start "Application Web FileChat (DEV)" cmd /c "http-server dist -p 8080 -c-1 --cors --log-ip"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur avec paramètres de debug
start http://localhost:8080?debug=true^&show_logs=true^&dev_mode=true

echo.
echo ===================================================
echo    FILECHAT DÉMARRÉ EN MODE DÉVELOPPEUR
echo ===================================================
echo.
echo Services actifs:
if "%OLLAMA_AVAILABLE%"=="1" echo [IA] Serveur IA local (debug) - http://localhost:8000
echo [WEB] Application web (debug) - http://localhost:8080?debug=true
echo.
echo Mode développeur activé:
echo - Logs détaillés dans la console
echo - Panel de debug visible dans l'application
echo - Traces réseau activées
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas
echo tant que vous utilisez FileChat.
echo.
echo Appuyez sur une touche pour retourner au menu principal...
pause >nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Application Web FileChat (DEV)" >nul 2>nul
if "%OLLAMA_AVAILABLE%"=="1" taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Serveur IA Local (DEV)" >nul 2>nul
goto MENU_PRINCIPAL

:MODE_SECOURS
cls
echo ===================================================
echo      DÉMARRAGE DE FILECHAT EN MODE DE SECOURS
echo ===================================================
echo.
echo Le mode de secours désactive toutes les fonctionnalités
echo avancées et utilise une configuration minimale pour
echo assurer un fonctionnement fiable.
echo.
echo Options du mode de secours:
echo [1] Mode de secours standard
echo [2] Mode de secours avec réinitialisation complète
echo [0] Retour au menu principal
echo.
set /p FALLBACK_MODE="Votre choix: "

if "%FALLBACK_MODE%"=="0" goto MENU_PRINCIPAL
if "%FALLBACK_MODE%"=="2" (
    echo.
    echo [INFO] Réinitialisation complète en cours...
    if exist "dist\" rmdir /s /q dist
    if exist "node_modules\" rmdir /s /q node_modules
    if exist ".vite\" rmdir /s /q .vite
    call npm cache clean --force
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Réinstallation des dépendances échouée
        echo [INFO] Continuation en mode ultra-minimal...
    )
)

echo.
echo [INFO] Démarrage en mode de secours...
call start-fallback-mode.bat
echo.
echo Appuyez sur une touche pour retourner au menu principal...
pause >nul
goto MENU_PRINCIPAL

:DIAGNOSTICS
cls
echo ===================================================
echo     DIAGNOSTICS ET RÉSOLUTION AUTOMATIQUE
echo ===================================================
echo.
echo [INFO] Analyse de l'environnement en cours...

REM Vérification de l'environnement système
for /f "tokens=*" %%a in ('wmic os get Caption ^| findstr /v "Caption"') do set OS_INFO=%%a
for /f "tokens=*" %%a in ('wmic cpu get name ^| findstr /v "Name"') do set CPU_INFO=%%a
for /f "tokens=*" %%a in ('wmic memorychip get capacity ^| findstr /v "Capacity"') do set /a MEMORY_GB=%%a/1073741824
for /f "tokens=*" %%a in ('wmic path win32_VideoController get name ^| findstr /v "Name"') do set GPU_INFO=%%a

echo [SYSTÈME] !OS_INFO!
echo [CPU] !CPU_INFO!
echo [RAM] !MEMORY_GB! GB
echo [GPU] !GPU_INFO!
echo.

REM Tests de base
echo [TEST] Vérification des fichiers essentiels...
set "MISSING_FILES=0"
if not exist "index.html" set /a MISSING_FILES+=1
if not exist "vite.config.ts" set /a MISSING_FILES+=1
if not exist "package.json" set /a MISSING_FILES+=1
if not exist "src\main.tsx" set /a MISSING_FILES+=1

if %MISSING_FILES% GTR 0 (
    echo [PROBLÈME] !MISSING_FILES! fichiers essentiels manquants.
    echo [SOLUTION] Une réinstallation complète est recommandée.
) else (
    echo [OK] Tous les fichiers essentiels sont présents.
)

REM Vérification des services
echo.
echo [TEST] Vérification des services...
set "OLLAMA_RUNNING=0"
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 set "OLLAMA_RUNNING=1"

if "%OLLAMA_RUNNING%"=="1" (
    echo [OK] Service Ollama détecté et actif.
) else (
    echo [INFO] Service Ollama non détecté.
    echo [SOLUTION] L'application utilisera le mode cloud par défaut.
)

REM Vérification des problèmes courants
echo.
echo [TEST] Recherche de problèmes courants...

REM Problème de noscript
findstr /C:"<noscript>" /C:"<head>" "index.html" >nul
if %ERRORLEVEL% EQU 0 (
    findstr /C:"<div" /C:"<noscript>" "index.html" | findstr /C:"<head>" >nul
    if %ERRORLEVEL% EQU 0 (
        echo [PROBLÈME] Balise noscript mal placée dans index.html.
        echo [SOLUTION] Correction automatique disponible.
        
        set /p FIX_NOSCRIPT="Appliquer la correction? [O/N]: "
        if /i "%FIX_NOSCRIPT%"=="O" (
            echo [INFO] Application de la correction...
            powershell -Command "(Get-Content index.html) | ForEach-Object { $_ -replace '(<head>.*)<noscript>(.*)<\/noscript>(.*<\/head>)', '$1$3<body><noscript>$2</noscript>' } | Set-Content index.html.fixed"
            move /y index.html.fixed index.html >nul
            echo [OK] Correction appliquée avec succès.
        )
    )
)

REM Problème de script Lovable
if exist "dist\index.html" (
    findstr "gptengineer.js" "dist\index.html" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [PROBLÈME] Script Lovable manquant dans le build.
        echo [SOLUTION] Correction automatique disponible.
        
        set /p FIX_LOVABLE="Appliquer la correction? [O/N]: "
        if /i "%FIX_LOVABLE%"=="O" (
            echo [INFO] Application de la correction...
            (for /f "delims=" %%i in (dist\index.html) do (
                echo %%i | findstr "<script " >nul
                if !errorlevel! EQU 0 (
                    echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
                )
                echo %%i
            )) > dist\index.html.temp
            move /y dist\index.html.temp dist\index.html >nul
            echo [OK] Script Lovable ajouté avec succès.
        )
    ) else (
        echo [OK] Script Lovable présent dans le build.
    )
) else (
    echo [INFO] Dossier dist non trouvé, construction nécessaire.
)

REM Problème de variable d'environnement
if not exist ".env.local" (
    echo [PROBLÈME] Fichier .env.local manquant.
    echo [SOLUTION] Création d'un fichier .env.local par défaut.
    
    set /p CREATE_ENV="Créer le fichier .env.local? [O/N]: "
    if /i "%CREATE_ENV%"=="O" (
        echo [INFO] Création du fichier .env.local...
        (
            echo VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
            echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
            echo VITE_API_URL=http://localhost:8000
            echo VITE_ENVIRONMENT=development
            echo VITE_SITE_URL=http://localhost:8080
        ) > .env.local
        echo [OK] Fichier .env.local créé avec succès.
    )
)

echo.
echo ===================================================
echo           RAPPORT DE DIAGNOSTIC COMPLET
echo ===================================================
echo.
echo Analyse du système:
echo [SYSTÈME] !OS_INFO!
echo [CPU] !CPU_INFO!
echo [RAM] !MEMORY_GB! GB
echo [GPU] !GPU_INFO!
echo.
echo Configuration recommandée:
if %MEMORY_GB% LSS 8 (
    echo [ATTENTION] Mémoire insuffisante (!MEMORY_GB! GB).
    echo             Mode cloud recommandé.
    set "RECOMMENDED_MODE=cloud"
) else if %MEMORY_GB% GEQ 16 (
    echo [OK] Mémoire suffisante pour toutes les fonctionnalités.
    set "RECOMMENDED_MODE=standard"
) else (
    echo [OK] Mémoire acceptable mais limitée.
    set "RECOMMENDED_MODE=standard"
)

echo !GPU_INFO! | findstr /i "NVIDIA RTX GTX" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] GPU compatible pour l'accélération matérielle.
    if "%RECOMMENDED_MODE%"=="standard" set "RECOMMENDED_MODE=standard_gpu"
) else (
    echo [INFO] GPU sans accélération spécifique détectée.
)

if "%OLLAMA_RUNNING%"=="1" (
    echo [OK] Ollama disponible pour l'IA locale.
    if "%RECOMMENDED_MODE%"=="standard_gpu" set "RECOMMENDED_MODE=standard_gpu_ollama"
    if "%RECOMMENDED_MODE%"=="standard" set "RECOMMENDED_MODE=standard_ollama"
) else (
    echo [INFO] Ollama non détecté, mode cloud sera utilisé pour l'IA.
)

echo.
echo Mode recommandé: 
if "%RECOMMENDED_MODE%"=="cloud" (
    echo [RECOMMANDATION] Mode cloud uniquement
    echo                   (Options limitées de matériel)
) else if "%RECOMMENDED_MODE%"=="standard_gpu_ollama" (
    echo [RECOMMANDATION] Mode standard avec GPU et Ollama
    echo                   (Configuration optimale)
) else if "%RECOMMENDED_MODE%"=="standard_ollama" (
    echo [RECOMMANDATION] Mode standard avec Ollama
    echo                   (Bonne configuration)
) else if "%RECOMMENDED_MODE%"=="standard_gpu" (
    echo [RECOMMANDATION] Mode standard avec GPU
    echo                   (Bonne configuration, sans IA locale)
) else (
    echo [RECOMMANDATION] Mode standard
    echo                   (Configuration de base)
)

echo.
echo Que souhaitez-vous faire?
echo [1] Démarrer avec le mode recommandé
echo [2] Résoudre les problèmes détectés
echo [3] Retourner au menu principal
echo.
set /p DIAG_ACTION="Votre choix: "

if "%DIAG_ACTION%"=="1" (
    if "%RECOMMENDED_MODE%"=="cloud" goto START_CLOUD
    if "%RECOMMENDED_MODE%"=="standard_gpu_ollama" goto START_STANDARD
    if "%RECOMMENDED_MODE%"=="standard_ollama" goto START_STANDARD
    if "%RECOMMENDED_MODE%"=="standard_gpu" goto START_STANDARD
    if "%RECOMMENDED_MODE%"=="standard" goto START_STANDARD
    goto START_STANDARD
) else if "%DIAG_ACTION%"=="2" (
    echo.
    echo [INFO] Application des corrections automatiques...
    
    REM Correction du fichier .env.local
    if not exist ".env.local" (
        echo [INFO] Création du fichier .env.local...
        (
            echo VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
            echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
            echo VITE_API_URL=http://localhost:8000
            echo VITE_ENVIRONMENT=development
            echo VITE_SITE_URL=http://localhost:8080
        ) > .env.local
        echo [OK] Fichier .env.local créé avec succès.
    )
    
    REM Correction de noscript si nécessaire
    findstr /C:"<noscript>" /C:"<head>" "index.html" >nul
    if %ERRORLEVEL% EQU 0 (
        findstr /C:"<div" /C:"<noscript>" "index.html" | findstr /C:"<head>" >nul
        if %ERRORLEVEL% EQU 0 (
            echo [INFO] Correction de la balise noscript...
            powershell -Command "(Get-Content index.html) | ForEach-Object { $_ -replace '(<head>.*)<noscript>(.*)<\/noscript>(.*<\/head>)', '$1$3<body><noscript>$2</noscript>' } | Set-Content index.html.fixed"
            move /y index.html.fixed index.html >nul
            echo [OK] Balise noscript corrigée.
        )
    )
    
    REM Reconstruction si nécessaire
    if not exist "dist\" (
        echo [INFO] Reconstruction de l'application...
        set NODE_OPTIONS=--max-old-space-size=4096
        call npm run build
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] Reconstruction échouée
            echo [INFO] Tentative en mode de secours...
            call start-fallback-mode.bat
            pause
            goto MENU_PRINCIPAL
        )
        echo [OK] Application reconstruite avec succès.
    )
    
    REM Correction du script Lovable si nécessaire
    if exist "dist\index.html" (
        findstr "gptengineer.js" "dist\index.html" >nul
        if %ERRORLEVEL% NEQ 0 (
            echo [INFO] Ajout du script Lovable au build...
            (for /f "delims=" %%i in (dist\index.html) do (
                echo %%i | findstr "<script " >nul
                if !errorlevel! EQU 0 (
                    echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
                )
                echo %%i
            )) > dist\index.html.temp
            move /y dist\index.html.temp dist\index.html >nul
            echo [OK] Script Lovable ajouté avec succès.
        )
    )
    
    echo.
    echo [OK] Corrections automatiques appliquées avec succès.
    echo     Vous pouvez maintenant démarrer l'application.
    pause
)
goto MENU_PRINCIPAL

:AIDE
cls
echo ===================================================
echo           AIDE ET DOCUMENTATION
echo ===================================================
echo.
echo Ce script offre plusieurs fonctionnalités pour vous aider
echo à exécuter et dépanner FileChat en local:
echo.
echo [1] Nettoyage et Configuration Complète
echo    - Nettoie complètement l'environnement
echo    - Réinstalle toutes les dépendances
echo    - Reconstruit l'application
echo    - Configure automatiquement selon votre matériel
echo.
echo [2] Démarrage Rapide
echo    - Lance l'application dans différents modes:
echo      * Standard: utilise l'IA locale si disponible
echo      * Cloud: utilise uniquement les services cloud
echo      * Développeur: active les logs détaillés
echo.
echo [3] Mode de Secours
echo    - Désactive les fonctionnalités avancées
echo    - Utilise une configuration minimale
echo    - Assure un fonctionnement même en cas de problème
echo.
echo [4] Diagnostics et Résolution Automatique
echo    - Analyse votre système et l'application
echo    - Détecte les problèmes courants
echo    - Applique des corrections automatiques
echo.
echo [5] Aide et Documentation
echo    - Affiche cette aide
echo.
echo ===================================================
echo.
echo Résolution des problèmes courants:
echo.
echo [PROBLÈME] Page blanche après chargement
echo [SOLUTION] Utilisez l'option "Mode de secours" ou
echo            "Diagnostics et résolution automatique"
echo.
echo [PROBLÈME] Erreur "AI edits didn't result in any changes"
echo [SOLUTION] Vérifiez que le script gptengineer.js est bien
echo            inclus dans index.html. Le diagnostic peut
echo            corriger ce problème automatiquement.
echo.
echo [PROBLÈME] Erreur avec noscript dans head
echo [SOLUTION] Le diagnostic détectera et corrigera
echo            automatiquement ce problème.
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour retourner au menu principal...
pause >nul
goto MENU_PRINCIPAL

:FIN
cls
echo ===================================================
echo      MERCI D'AVOIR UTILISÉ L'ASSISTANT FILECHAT
echo ===================================================
echo.
echo À bientôt!
echo.
timeout /t 3 >nul
exit /b 0

