
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
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo [OK] Node.js !NODE_VERSION! est correctement installé.
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
        for /f "tokens=*" %%a in ('python3 --version') do set PYTHON_VERSION=%%a
        echo [OK] !PYTHON_VERSION! est installé.
    )
) else (
    for /f "tokens=*" %%a in ('python --version') do set PYTHON_VERSION=%%a
    echo [OK] !PYTHON_VERSION! est correctement installé.
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
    
    REM Vérification des types MIME
    echo [5.1] Analyse des risques de problèmes MIME sur Vercel...
    findstr "type=\"module\"" "dist\index.html" >nul
    if %ERRORLEVEL% EQU 0 (
        echo  [OK] Les attributs type="module" sont présents dans les balises script.
    ) else (
        echo  [ATTENTION] Balises script sans attribut type="module" détectées.
        echo              Utilisez le script de correction avant le déploiement.
    )
    
    if exist "vercel.json" (
        findstr "application/javascript" "vercel.json" >nul
        if %ERRORLEVEL% EQU 0 (
            echo  [OK] Configuration MIME pour JavaScript présente dans vercel.json.
        ) else (
            echo  [ATTENTION] Configuration MIME possiblement incomplète dans vercel.json.
        )
    ) else (
        echo  [ATTENTION] Fichier vercel.json manquant. Nécessaire pour un déploiement correct.
    )
) else (
    echo [INFO] Aucune build détectée.
    echo        Exécutez 'npm run build' pour créer une build.
)
echo.

echo [6] Test de connectivité réseau...
ping -n 1 api.openai.com >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Connexion à Internet fonctionnelle.
) else (
    echo [ATTENTION] Problème de connexion Internet détecté.
    echo            Vérifiez votre connexion réseau.
)
echo.

echo ===================================================
echo   RÉSULTATS ET RECOMMANDATIONS
echo ===================================================
echo.
echo Modes disponibles:
echo.
echo [✓] Mode cloud (toujours disponible)

if %OLLAMA_RUNNING% EQU 1 (
    echo [✓] Mode IA locale via Ollama (détecté et actif)
) else (
    echo [ ] Mode IA locale via Ollama (non disponible)
)

python -c "import transformers" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Mode IA locale via Python et Hugging Face (disponible)
) else (
    echo [ ] Mode IA locale via Python et Hugging Face (non disponible)
)
echo.

echo Recommandation pour le déploiement:
echo - Avant de déployer sur Vercel, exécutez: scripts\prepare-deployment.bat
echo - Cela corrigera automatiquement les problèmes de MIME types connus
echo.

echo ===================================================
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
