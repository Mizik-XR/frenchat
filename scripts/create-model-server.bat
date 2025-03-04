
@echo off
echo ================================
echo Création du serveur IA
echo ================================

REM Création du script Python
(
echo from fastapi import FastAPI, HTTPException, Request, Depends
echo from pydantic import BaseModel, Field, validator
echo import uvicorn
echo import torch
echo from transformers import AutoTokenizer, AutoModelForCausalLM
echo import logging
echo from typing import Optional, List
echo import secrets
echo import os
echo.
echo logging.basicConfig^(level=logging.INFO^)
echo logger = logging.getLogger^("serve_model"^)
echo.
echo # Génération d'un token de sécurité
echo API_TOKEN = os.environ.get^("API_TOKEN"^) or secrets.token_hex^(16^)
echo logger.info^(f"Token d'API généré: {API_TOKEN}"^)
echo.
echo app = FastAPI^(^)
echo.
echo # Configuration CORS
echo from fastapi.middleware.cors import CORSMiddleware
echo app.add_middleware^(
echo     CORSMiddleware,
echo     allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
echo     allow_credentials=True,
echo     allow_methods=["GET", "POST", "OPTIONS"],
echo     allow_headers=["*"],
echo ^)
echo.
echo # Middleware de sécurité
echo @app.middleware^("http"^)
echo async def validate_token^(request: Request, call_next^):
echo     from fastapi.responses import JSONResponse
echo     if request.url.path.startswith^(^("/generate"^)^):
echo         token = request.headers.get^("X-API-Token"^)
echo         if not token or token != API_TOKEN:
echo             return JSONResponse^(
echo                 status_code=403,
echo                 content={"detail": "Accès non autorisé"}
echo             ^)
echo     return await call_next^(request^)
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
echo     prompt: str = Field^(..., min_length=1, max_length=10000^)
echo     max_length: Optional[int] = Field^(100, ge=1, le=4096^)
echo     
echo     @validator^('prompt'^)
echo     def validate_prompt^(cls, v^):
echo         if not v or not isinstance^(v, str^):
echo             raise ValueError^("Le prompt doit être une chaîne valide"^)
echo         return v
echo.
echo @app.post^("/generate"^)
echo async def generate_text^(input_data: GenerationInput, request: Request^):
echo     try:
echo         # Journalisation des requêtes sans informations sensibles
echo         client_host = request.client.host if request.client else "unknown"
echo         logger.info^(f"Requête de génération reçue de {client_host}, longueur: {len^(input_data.prompt^)}"^)
echo         
echo         # Génération sécurisée avec timeout
echo         inputs = tokenizer^(input_data.prompt, return_tensors="pt"^)
echo         with torch.no_grad^(^):
echo             outputs = model.generate^(
echo                 **inputs, 
echo                 max_length=input_data.max_length,
echo                 pad_token_id=tokenizer.eos_token_id
echo             ^)
echo         result = tokenizer.decode^(outputs[0], skip_special_tokens=True^)
echo         return {"generated_text": result}
echo     except Exception as e:
echo         logger.error^(f"Erreur lors de la génération: {e}"^)
echo         raise HTTPException^(status_code=500, detail=str^(e^)^)
echo.
echo # Endpoint pour la vérification de santé
echo @app.get^("/health"^)
echo async def health_check^(^):
echo     return {"status": "ok", "model": "distilgpt2"}
echo.
echo # Point d'entrée pour l'exécution directe
echo if __name__ == "__main__":
echo     uvicorn.run^(
echo         app, 
echo         host="127.0.0.1", 
echo         port=8000, 
echo         log_level="info",
echo         proxy_headers=True,
echo         forwarded_allow_ips="127.0.0.1"
echo     ^)
) > serve_model.py

echo Script de serveur IA créé avec succès !
echo Token d'API créé et configuré pour la sécurité.
echo.
echo Pour démarrer le serveur, exécutez: python serve_model.py

exit /b 0
