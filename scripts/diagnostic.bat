
@echo off
echo ================================
echo Diagnostic de l'environnement FileChat
echo ================================
echo.

echo [1] Vérification de Python...
python --version
echo.

echo [2] Vérification de Rust...
rustc --version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Rust n'est pas installé. Mode léger activé.
) else (
    echo Rust est installé:
    rustc --version
    cargo --version
)
echo.

echo [3] Vérification de l'environnement virtuel...
if exist "venv\" (
    echo Environnement virtuel trouvé.
    call venv\Scripts\activate.bat
    echo.
    
    echo [4] Versions des packages installés:
    pip list | findstr "torch transformers tokenizers fastapi"
    echo.
    
    echo [5] Test d'importation Python...
    python -c "import transformers; import tokenizers; import fastapi; print('Import réussi!')" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Certains packages ne sont pas correctement installés.
        echo Exécutez 'scripts\setup-venv.bat' pour réinstaller les dépendances.
    )
) else (
    echo Environnement virtuel non trouvé.
    echo Exécutez 'scripts\setup-venv.bat' pour créer l'environnement.
)

echo.
echo ================================
echo Fin du diagnostic
echo ================================
echo.
pause
