
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Diagnostic complet

REM Configuration de l'interface graphique
mode con cols=100 lines=30
color 1F

echo ===================================================
echo     DIAGNOSTIC COMPLET DE FILECHAT
echo ===================================================
echo.

echo [1] Vérification de l'environnement JavaScript...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé.
    echo         Téléchargez-le depuis https://nodejs.org/
) else (
    node --version
    echo [OK] Node.js est correctement installé.
)
echo.

echo [2] Vérification de Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where python3 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Python n'est pas installé ou n'est pas dans le PATH.
        echo        Le mode cloud reste disponible.
        echo        Pour utiliser l'IA en local, installez Python depuis https://www.python.org/downloads/
    ) else (
        python3 --version
        echo [OK] Python3 est installé.
    )
) else (
    python --version
    echo [OK] Python est correctement installé.
)
echo.

echo [3] Vérification d'Ollama...
set "OLLAMA_RUNNING=0"
netstat -an | findstr ":11434" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama est en cours d'exécution sur le port 11434.
    set "OLLAMA_RUNNING=1"
) else (
    where ollama >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Ollama est installé mais n'est pas en cours d'exécution.
        echo        Démarrez Ollama pour utiliser l'IA locale.
    ) else (
        echo [INFO] Ollama n'est pas détecté sur ce système.
        echo        Téléchargez-le depuis https://ollama.ai/download
    )
)
echo.

echo [4] Vérification des dépendances npm...
if exist "node_modules\" (
    echo [OK] Dépendances npm installées.
) else (
    echo [INFO] Les dépendances npm ne sont pas installées.
    echo        Exécutez "npm install" pour les installer.
)
echo.

echo [5] Vérification de la build...
if exist "dist\index.html" (
    echo [OK] Build existante détectée.
) else (
    echo [INFO] Aucune build détectée.
    echo        Exécutez "npm run build" pour créer une build.
)
echo.

echo [6] Test de connectivité réseau...
ping -n 1 api.openai.com >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Connexion à Internet fonctionnelle.
) else (
    echo [ATTENTION] Problème de connexion Internet détecté.
    echo             Vérifiez votre connexion réseau.
)
echo.

echo ===================================================
echo     RÉSULTATS ET RECOMMANDATIONS
echo ===================================================
echo.
echo Modes disponibles:
echo.
echo [v] Mode cloud (toujours disponible)

if %OLLAMA_RUNNING% EQU 1 (
    echo [v] Mode IA locale via Ollama (détecté et actif)
) else (
    echo [ ] Mode IA locale via Ollama (non disponible)
)

python -c "import transformers" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [v] Mode IA locale via Python et Hugging Face (disponible)
) else (
    echo [ ] Mode IA locale via Python et Hugging Face (non disponible)
)
echo.

echo Recommandation:
if %OLLAMA_RUNNING% EQU 1 (
    echo - Utilisez "start-universal.bat" pour démarrer avec Ollama (mode hybride)
) else (
    echo - Utilisez "start-app-simplified.bat" pour le mode cloud uniquement
)
echo.

echo ===================================================
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0
