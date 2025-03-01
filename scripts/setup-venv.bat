
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

REM Installation des autres dépendances avec mécanisme de reprise
echo Installation des autres dépendances...
pip install --no-cache-dir -r requirements.txt

echo ================================
echo Installation terminée !
echo ================================
echo Pour démarrer le serveur: python serve_model.py
echo ================================

exit /b 0
