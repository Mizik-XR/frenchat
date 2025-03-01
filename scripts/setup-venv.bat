
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

REM Installation des dépendances Python - Version améliorée
echo Installation des dépendances de base...
pip install --no-cache-dir setuptools wheel

REM Installation de PyTorch avec l'URL correcte
echo Installation de PyTorch...
pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

REM Déterminer si on installe avec Rust ou mode léger
if "%NO_RUST_INSTALL%"=="1" (
    echo Mode d'installation léger, sans dépendances nécessitant Rust...
    pip install --no-cache-dir fastapi uvicorn pydantic tokenizers transformers
    echo Utilisation de modèles inférences via API - pas besoin de bitsandbytes
) else (
    echo Installation complète des dépendances...
    pip install --no-cache-dir -r requirements.txt
)

echo ================================
echo Installation terminée !
echo ================================
echo Pour démarrer le serveur: python serve_model.py
echo ================================

exit /b 0
