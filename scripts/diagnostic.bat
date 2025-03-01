
@echo off
echo ================================
echo Diagnostic de l'environnement FileChat
echo ================================
echo.

echo [1] Vérification de Python...
python --version
echo.

echo [2] Vérification de Rust...
rustc --version
cargo --version
echo.

echo [3] Vérification de l'environnement virtuel...
if exist "venv\" (
    echo Environnement virtuel trouvé.
    call venv\Scripts\activate.bat
    echo.
    
    echo [4] Versions des packages installés:
    pip list | findstr "torch transformers tokenizers"
    echo.
    
    echo [5] Test d'importation Python...
    python -c "import torch; import transformers; import tokenizers; print('Import réussi!')"
) else (
    echo Environnement virtuel non trouvé.
)

echo.
echo ================================
echo Fin du diagnostic
echo ================================
echo.
pause
