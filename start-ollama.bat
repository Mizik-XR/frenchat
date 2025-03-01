
@echo off
echo ================================
echo Service FileChat - Mode Ollama
echo ================================
echo.
echo Ce script va vérifier si Ollama est installé et le démarrer.
echo Si Ollama n'est pas installé, il vous guidera pour l'installer.
echo.

REM Vérification d'Ollama
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Ollama n'est pas détecté sur votre système.
    echo.
    echo Pour installer Ollama, visitez: https://ollama.ai/download
    echo.
    echo Une fois Ollama installé, relancez ce script.
    pause
    start https://ollama.ai/download
    exit /b 1
)

echo [OK] Ollama est installé sur votre système.
echo.

REM Vérification si Ollama est déjà en cours d'exécution
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Ollama est déjà en cours d'exécution.
) else (
    echo [INFO] Démarrage d'Ollama...
    start "Ollama" /min ollama serve
    timeout /t 5 /nobreak >nul
)

REM Vérification du modèle Mistral
echo [INFO] Vérification du modèle Mistral...
ollama list | findstr "mistral" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Téléchargement du modèle Mistral...
    ollama pull mistral
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec du téléchargement du modèle Mistral.
        pause
        exit /b 1
    )
)

echo.
echo ================================
echo   Ollama est prêt à l'emploi!
echo ================================
echo.
echo Pour utiliser Ollama avec FileChat:
echo 1. Accédez aux paramètres IA dans FileChat
echo 2. Sélectionnez "IA Locale" comme source
echo 3. Dans l'URL, entrez: http://localhost:11434
echo.
echo Lorsque vous avez terminé, vous pouvez fermer cette fenêtre.
echo (Ollama continuera à fonctionner en arrière-plan)
echo.
pause
