
@echo off
echo ================================
echo Configuration environnement virtuel
echo ================================

REM Création de l'environnement virtuel
if not exist "venv\" (
    echo Création de l'environnement virtuel...
    python -m venv venv
    timeout /t 2 /nobreak >nul
)

REM Activation de l'environnement
call venv\Scripts\activate.bat

REM Mise à jour de pip
python -m pip install --upgrade pip
pip cache purge

REM Installation des dépendances Python
pip install --no-cache-dir setuptools wheel
pip install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir tokenizers --no-build-isolation
pip install --no-cache-dir ^
    transformers==4.36.2 ^
    accelerate==0.26.1 ^
    datasets==2.16.1 ^
    fastapi==0.109.0 ^
    uvicorn==0.27.0 ^
    pydantic==2.6.1 ^
    bitsandbytes==0.41.1

echo ================================
echo Installation terminée !
echo ================================
echo Pour démarrer le serveur: python serve_model.py
echo ================================

exit /b 0
