
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Diagnostique FileChat

REM Configuration de l'interface graphique
mode con cols=100 lines=30
color 1F

echo ================================
echo Diagnostic de l'environnement FileChat
echo ================================
echo.

REM Animation pour simuler le traitement
echo Analyse de votre système en cours...
for /L %%i in (1,1,20) do (
    <nul set /p =█
    timeout /t 0 /nobreak >nul
)
echo  OK!
echo.

echo [1] Vérification de Python...
python --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Python n'est pas installé ou n'est pas dans votre PATH.
    echo            Cela ne pose pas de problème en mode cloud uniquement.
) else (
    python --version
    echo [OK] Python est correctement installé.
)
echo.

echo [2] Vérification de Ollama...
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama est actif et fonctionne sur votre système.
    echo     C'est la solution recommandée pour l'IA locale.
) else (
    where ollama >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Ollama est installé mais n'est pas actif.
        echo       Vous pouvez démarrer Ollama pour utiliser l'IA locale.
    ) else (
        echo [INFO] Ollama n'est pas installé.
        echo       Téléchargement recommandé: https://ollama.ai/download
    )
)
echo.

echo [3] Vérification de Rust...
rustc --version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Rust n'est pas installé.
    echo       Ce n'est pas un problème si vous utilisez Ollama ou le mode cloud.
) else (
    echo [OK] Rust est correctement installé:
    rustc --version
    cargo --version
)
echo.

echo [4] Vérification de l'environnement virtuel...
if exist "venv\" (
    echo [OK] Environnement virtuel trouvé.
    call venv\Scripts\activate.bat
    
    echo [5] Versions des packages installés:
    pip list | findstr "torch transformers tokenizers fastapi" 2>nul || echo "     Aucun package IA trouvé (mode cloud uniquement)"
    echo.
    
    echo [6] Test d'importation Python...
    python -c "try: import transformers; import tokenizers; import fastapi; print('[OK] Import réussi!'); except ImportError as e: print('[INFO] Certains packages ne sont pas installés:',e)" 2>nul
) else (
    echo [INFO] Environnement virtuel non trouvé.
    echo       Ce n'est pas un problème si vous utilisez le mode cloud uniquement.
)

echo.
echo ================================
echo Recommandations
echo ================================
echo.
echo Votre système est configuré pour:
if exist "venv\" (
    echo [V] Mode IA locale (Python)
) else (
    echo [ ] Mode IA locale (Python) - Non configuré
)

netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% EQU 0 (
    echo [V] Mode IA locale (Ollama) - Recommandé
) else (
    echo [ ] Mode IA locale (Ollama) - Non configuré/actif
)

echo [V] Mode Cloud (Toujours disponible)
echo.
echo Solution recommandée:
echo -------------------
echo 1. Utiliser Ollama pour l'IA locale (simple et efficace)
echo 2. Utiliser le mode cloud si l'IA locale n'est pas nécessaire
echo.
echo ================================
echo Fin du diagnostic
echo ================================
echo.
echo Pour obtenir de l'aide supplémentaire, contactez le support technique.
echo.
pause
