
@echo off
chcp 65001
setlocal enabledelayedexpansion

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

REM Création d'un environnement virtuel
if not exist "venv\" (
    echo Création de l'environnement virtuel...
    python -m venv venv
    REM Pause pour s'assurer que l'environnement est bien créé
    timeout /t 2 /nobreak >nul
)

REM Activation de l'environnement virtuel
echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installation des dépendances Python avec indicateur de progression
echo Installation des dépendances Python...
pip install -q --no-cache-dir --disable-pip-version-check ^
    transformers==4.36.2 ^
    torch==2.0.1 ^
    accelerate==0.26.1 ^
    datasets==2.16.1 ^
    fastapi==0.109.0 ^
    uvicorn==0.27.0

REM Création du script Python avec gestion des erreurs améliorée
echo Création du script du serveur...
(
echo from transformers import pipeline
echo from fastapi import FastAPI, HTTPException
echo from pydantic import BaseModel
echo import uvicorn
echo import logging
echo from typing import Optional
echo.
echo # Configuration des logs
echo logging.basicConfig^(level=logging.INFO^)
echo logger = logging.getLogger^("serve_model"^)
echo.
echo app = FastAPI^(^)
echo.
echo try:
echo     logger.info^("Chargement du modèle..."^)
echo     model = pipeline^("text-generation", model="facebook/opt-125m", device="cpu"^)
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
echo         result = model^(input_data.prompt, max_length=input_data.max_length^)
echo         return {"generated_text": result[0]["generated_text"]}
echo     except Exception as e:
echo         logger.error^(f"Erreur lors de la génération: {e}"^)
echo         raise HTTPException^(status_code=500, detail=str^(e^)^)
echo.
echo if __name__ == "__main__":
echo     uvicorn.run^(app, host="0.0.0.0", port=8000, log_level="info"^)
) > serve_model.py

REM Lancement du serveur avec gestion des erreurs
echo.
echo ================================
echo Démarrage du serveur IA local...
echo ================================
start "Serveur IA" cmd /c "python serve_model.py"

echo.
echo Le serveur démarre... 
echo L'API sera disponible sur http://localhost:8000
echo Pour arrêter le serveur, fermez cette fenêtre.
echo.
pause
