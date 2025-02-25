
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Vérification des mises à jour...
echo ================================

REM Vérification des mises à jour NPM
echo Recherche des dépendances obsolètes...
call npm outdated

set /p UPDATE_CHOICE=Voulez-vous mettre à jour les dépendances ? (O/N) 
if /i "%UPDATE_CHOICE%"=="O" (
    echo Mise à jour des dépendances...
    call npm update
)

echo ================================
echo Installation de l'environnement IA
echo ================================

REM Vérification de Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé. 
    echo Téléchargement de Python...
    curl -o python-installer.exe https://www.python.org/ftp/python/3.9.7/python-3.9.7-amd64.exe
    echo Installation de Python...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    del python-installer.exe
)

REM Vérification de Rust avec rustup-init.exe
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Rust...
    curl -o rustup-init.exe https://win.rustup.rs/x86_64
    rustup-init.exe -y --default-toolchain stable
    del rustup-init.exe
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    echo Rust installé avec succès
)

REM Création d'un environnement virtuel s'il n'existe pas
if not exist "venv\" (
    echo Création de l'environnement virtuel...
    python -m venv venv
    timeout /t 2 /nobreak >nul
)

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

REM Mise à jour de pip
python -m pip install --upgrade pip

REM Suppression du cache pip pour éviter les conflits
echo Nettoyage du cache pip...
pip cache purge

REM Installation des dépendances Python dans un ordre spécifique
echo Installation des dépendances Python...
pip install --no-cache-dir setuptools wheel
pip install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir tokenizers --no-build-isolation
pip install --no-cache-dir transformers==4.36.2
pip install --no-cache-dir ^
    accelerate==0.26.1 ^
    datasets==2.16.1 ^
    fastapi==0.109.0 ^
    uvicorn==0.27.0 ^
    pydantic==2.6.1

REM Création du script Python avec un modèle plus léger
echo Création du script du serveur...
(
echo from fastapi import FastAPI, HTTPException
echo from pydantic import BaseModel
echo import uvicorn
echo import torch
echo from transformers import AutoTokenizer, AutoModelForCausalLM
echo import logging
echo from typing import Optional
echo.
echo logging.basicConfig^(level=logging.INFO^)
echo logger = logging.getLogger^("serve_model"^)
echo.
echo app = FastAPI^(^)
echo.
echo try:
echo     logger.info^("Chargement du modèle..."^)
echo     tokenizer = AutoTokenizer.from_pretrained^("distilgpt2"^)
echo     model = AutoModelForCausalLM.from_pretrained^("distilgpt2"^)
echo     logger.info^("Modèle chargé avec succès"^)
echo except Exception as e:
echo     logger.error^(f"Erreur lors du chargement du modèle: {e}"^)
echo     raise
echo.
echo class GenerationInput^(BaseModel^):
echo     prompt: str
echo     max_length: Optional[int] = 100
echo.
echo @app.post^("/generate"^)
echo async def generate_text^(input_data: GenerationInput^):
echo     try:
echo         inputs = tokenizer^(input_data.prompt, return_tensors="pt"^)
echo         outputs = model.generate^(**inputs, max_length=input_data.max_length^)
echo         result = tokenizer.decode^(outputs[0], skip_special_tokens=True^)
echo         return {"generated_text": result}
echo     except Exception as e:
echo         logger.error^(f"Erreur lors de la génération: {e}"^)
echo         raise HTTPException^(status_code=500, detail=str^(e^)^)
echo.
echo if __name__ == "__main__":
echo     uvicorn.run^(app, host="0.0.0.0", port=8000, log_level="info"^)
) > serve_model.py

echo.
echo ================================
echo Démarrage du serveur IA local...
echo ================================

REM Démarrage du serveur dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

echo.
echo Le serveur démarre... 
echo L'API sera disponible sur http://localhost:8000
echo Pour arrêter le serveur, fermez cette fenêtre ou la fenêtre du serveur.
echo.
echo Appuyez sur une touche pour quitter...
pause
