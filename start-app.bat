
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
)

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

REM Installation des dépendances Python
echo Installation des dépendances Python...
pip install transformers torch accelerate datasets fastapi uvicorn

REM Création du script Python
echo Création du script du serveur...
(
echo from transformers import pipeline
echo from fastapi import FastAPI
echo from pydantic import BaseModel
echo import uvicorn
echo.
echo app = FastAPI^(^)
echo model = pipeline^("text-generation", model="facebook/opt-125m"^)
echo.
echo class GenerationInput^(BaseModel^):
echo     prompt: str
echo     max_length: int = 100
echo.
echo @app.post^("/generate"^)
echo async def generate_text^(input_data: GenerationInput^):
echo     result = model^(input_data.prompt, max_length=input_data.max_length^)
echo     return {"generated_text": result[0]["generated_text"]}
echo.
echo if __name__ == "__main__":
echo     uvicorn.run^(app, host="0.0.0.0", port=8000^)
) > serve_model.py

REM Lancement du serveur
echo.
echo ================================
echo Démarrage du serveur IA local...
echo ================================
start "Serveur IA" python serve_model.py

echo.
echo Le serveur démarre... 
echo L'API sera disponible sur http://localhost:8000
echo Pour arrêter le serveur, fermez cette fenêtre.
echo.
pause
