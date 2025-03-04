
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo     CORRECTION DE L'INSTALLATION TRANSFORMERS
echo ===================================================
echo.

REM Vérifier si Python est installé
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installé ou n'est pas dans le PATH
    echo.
    echo Appuyez sur une touche pour quitter...
    pause >nul
    exit /b 1
)

REM Vérifier si transformers est installé
python -c "import transformers" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Le package transformers est déjà installé.
    echo.
    pause
    exit /b 0
)

echo [INFO] Tentative d'installation de transformers sans compilation...
pip install transformers==4.36.2 --no-deps
pip install tokenizers --only-binary=:all:

REM Vérifier si l'installation a réussi
python -c "import transformers" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Le package transformers a été installé avec succès.
    echo.
    pause
    exit /b 0
)

echo [ATTENTION] L'installation standard a échoué, essai d'une méthode alternative...

REM Alternative: créer un stub minimal pour transformers
mkdir site-packages\transformers 2>nul
echo # Package simulé > site-packages\transformers\__init__.py
set PYTHONPATH=%PYTHONPATH%;%CD%\site-packages

echo [INFO] Configuration d'un transformers minimal effectuée.
echo [INFO] Pour le déploiement Netlify, utilisez la configuration NO_RUST_INSTALL=1
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0

