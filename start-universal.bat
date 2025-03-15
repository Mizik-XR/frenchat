
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Assistant d'installation et démarrage

REM Configuration de l'interface graphique
mode con cols=100 lines=30
color 1F

echo ===================================================
echo      ASSISTANT FILECHAT - INSTALLATION ET DÉMARRAGE
echo ===================================================
echo.

REM Ajout d'une pause en cas d'erreur pour voir les messages
set "ERROR_PAUSE=pause"

REM Vérification des prérequis
echo [ÉTAPE 1/4] Analyse du système et des dépendances...
echo.

REM Détection du mode optimal
set "USE_OLLAMA=0"
set "USE_PYTHON=0"
set "USE_CLOUD=1"
set "OLLAMA_DETECTED=0"
set "PYTHON_DETECTED=0"
set "PYTHON_VER="
set "TRANSFORMERS_AVAILABLE=0"

REM Vérification de la présence d'Ollama (prioritaire)
echo [VÉRIFICATION] Recherche d'Ollama...
where ollama >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "OLLAMA_DETECTED=1"
    echo [OK] Ollama est installé sur ce système.
) else (
    netstat -an | findstr ":11434" | findstr "LISTENING" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "OLLAMA_DETECTED=1"
        echo [OK] Ollama est détecté comme service actif.
    ) else (
        echo [INFO] Ollama n'est pas installé ou n'est pas en cours d'exécution.
    )
)

REM Vérification de la présence de Python
echo [VÉRIFICATION] Recherche de Python...
python --version >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2" %%G in ('python --version 2^>^&1') do set "PYTHON_VER=%%G"
    set "PYTHON_DETECTED=1"
    echo [OK] Python %PYTHON_VER% est installé.
    
    echo [VÉRIFICATION] Recherche de la bibliothèque Transformers...
    python -c "import transformers" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "TRANSFORMERS_AVAILABLE=1"
        echo [OK] La bibliothèque Transformers est installée.
    ) else (
        echo [INFO] La bibliothèque Transformers n'est pas installée.
    )
) else (
    echo [INFO] Python n'est pas installé ou n'est pas dans le PATH.
)

REM Configuration du mode d'exécution optimal
if %OLLAMA_DETECTED% EQU 1 (
    set "USE_OLLAMA=1"
    echo [DÉCISION] Mode IA locale via Ollama sélectionné comme prioritaire.
) else if %PYTHON_DETECTED% EQU 1 (
    if %TRANSFORMERS_AVAILABLE% EQU 1 (
        set "USE_PYTHON=1"
        echo [DÉCISION] Mode IA locale via Python sélectionné.
    ) else (
        set "USE_CLOUD=1"
        echo [DÉCISION] Mode cloud sélectionné (Python détecté sans Transformers).
    )
) else (
    set "USE_CLOUD=1"
    echo [DÉCISION] Mode cloud sélectionné (aucune IA locale disponible).
)

echo.

REM Installation des composants manquants si nécessaire
echo [ÉTAPE 2/4] Installation des composants nécessaires...
echo.

REM Proposition d'installation d'Ollama si non détecté
if %OLLAMA_DETECTED% EQU 0 (
    echo [QUESTION] Souhaitez-vous installer Ollama pour utiliser l'IA en local ?
    echo           Cela offre une meilleure confidentialité et performance.
    echo           1. Oui, installer Ollama
    echo           2. Non, utiliser le mode cloud
    set /p "INSTALL_OLLAMA=Votre choix (1/2): "
    
    if "!INSTALL_OLLAMA!"=="1" (
        echo [ACTION] Téléchargement d'Ollama en cours...
        start https://ollama.ai/download
        echo [INFO] Une fois l'installation terminée, relancez ce script.
        echo [INFO] Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 0
    ) else (
        echo [INFO] Installation d'Ollama ignorée, utilisation du mode cloud.
    )
    echo.
)

REM Vérification/Construction de l'application si nécessaire
echo [ÉTAPE 3/4] Préparation de l'application FileChat...
echo.

REM Vérification de Node.js et npm
echo [VÉRIFICATION] Recherche de Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH.
    echo [INFO] Veuillez installer Node.js depuis https://nodejs.org/
    echo [INFO] Appuyez sur une touche pour quitter...
    %ERROR_PAUSE%
    exit /b 1
)

REM Vérification si l'application est déjà construite
if not exist "dist\" (
    echo [ACTION] Construction de l'application en cours...
    
    REM Vérification des modules node
    if not exist "node_modules\" (
        echo [ACTION] Installation des dépendances Node.js...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] Installation des dépendances échouée
            echo [INFO] Vérifiez votre connexion Internet et réessayez
            echo.
            echo Appuyez sur une touche pour quitter...
            %ERROR_PAUSE%
            exit /b 1
        )
    )
    
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Construction de l'application échouée
        echo [INFO] Vérifiez les erreurs ci-dessus et réessayez
        echo.
        echo Appuyez sur une touche pour quitter...
        %ERROR_PAUSE%
        exit /b 1
    )
    echo [OK] Application construite avec succès.
) else (
    echo [OK] Application déjà construite.
)

echo.

REM Démarrage des services
echo [ÉTAPE 4/4] Démarrage des services...
echo.

REM Démarrage d'Ollama si disponible et non démarré
if %USE_OLLAMA% EQU 1 (
    netstat -an | findstr ":11434" | findstr "LISTENING" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ACTION] Démarrage d'Ollama...
        start "" ollama serve
        timeout /t 5 /nobreak > nul
    ) else (
        echo [OK] Ollama est déjà en cours d'exécution.
    )
    
    REM Vérification du modèle Mistral
    echo [VÉRIFICATION] Vérification du modèle Mistral dans Ollama...
    ollama list | findstr "mistral" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ACTION] Téléchargement du modèle Mistral (cela peut prendre quelques minutes)...
        start "Téléchargement Mistral" /min cmd /c "ollama pull mistral:latest && echo Modèle téléchargé avec succès! && pause"
        echo [INFO] Le téléchargement du modèle continue en arrière-plan.
    ) else (
        echo [OK] Modèle Mistral déjà téléchargé.
    )
)

REM Démarrage du serveur Python si nécessaire
if %USE_PYTHON% EQU 1 (
    echo [ACTION] Démarrage du serveur IA en Python...
    if not exist "venv\" (
        echo [ACTION] Création de l'environnement virtuel Python...
        python -m venv venv
        call venv\Scripts\activate
        pip install -r requirements.txt
    )
    start "Serveur IA Python" /min cmd /c "venv\Scripts\python.exe serve_model.py"
    timeout /t 2 /nobreak > nul
)

REM Démarrage du serveur web
echo [ACTION] Démarrage du serveur web...
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ACTION] Installation du serveur web...
    call npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Installation globale échouée, tentative avec npx...
        set "HTTP_SERVER_CMD=npx http-server dist -p 8080 -c-1 --cors"
    ) else (
        set "HTTP_SERVER_CMD=http-server dist -p 8080 -c-1 --cors"
    )
) else (
    set "HTTP_SERVER_CMD=http-server dist -p 8080 -c-1 --cors"
)

REM Démarrage du serveur avec une nouvelle fenêtre CMD
start "Serveur Web FileChat" /min cmd /c "%HTTP_SERVER_CMD%"
timeout /t 2 /nobreak > nul

REM Construction de l'URL avec les paramètres appropriés
set "APP_URL=http://localhost:8080/?"

if %USE_OLLAMA% EQU 1 (
    set "APP_URL=!APP_URL!client=true^&aiServiceType=local^&localProvider=ollama^&localAIUrl=http://localhost:11434"
) else if %USE_PYTHON% EQU 1 (
    set "APP_URL=!APP_URL!client=true^&aiServiceType=local^&localProvider=transformers^&localAIUrl=http://localhost:8000"
) else (
    set "APP_URL=!APP_URL!client=true^&forceCloud=true"
)

REM Ouvrir le navigateur
echo [ACTION] Ouverture de FileChat dans votre navigateur...
start "" "!APP_URL!"

echo.
echo ===================================================
echo       FILECHAT EST PRÊT À ÊTRE UTILISÉ
echo ===================================================
echo.
echo L'application est maintenant accessible avec:

if %USE_OLLAMA% EQU 1 (
    echo [v] Mode IA locale via Ollama
) else if %USE_PYTHON% EQU 1 (
    echo [v] Mode IA locale via Python
) else (
    echo [v] Mode cloud
)

echo.
echo URL d'accès: !APP_URL!
echo.
echo Cette fenêtre peut être minimisée. Ne la fermez pas tant que
echo vous utilisez FileChat.
echo.
echo Pour quitter, fermez cette fenêtre.
echo ===================================================
echo.

REM Message en cas d'erreur pour faciliter le diagnostic
if errorlevel 1 (
    echo [ERREUR] Une erreur s'est produite lors de l'exécution du script.
    echo [INFO] Code d'erreur: %errorlevel%
    echo.
    echo Veuillez signaler cette erreur en incluant:
    echo - Le message d'erreur ci-dessus
    echo - Votre système d'exploitation
    echo - Les étapes qui ont mené à cette erreur
    echo.
    echo Appuyez sur une touche pour quitter...
    %ERROR_PAUSE%
    exit /b %errorlevel%
)

REM Boucle infinie pour garder la fenêtre ouverte
echo Appuyez sur Ctrl+C pour quitter...
:boucle
timeout /t 60 /nobreak > nul
goto boucle
