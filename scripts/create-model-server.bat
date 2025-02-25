
@echo off
echo ================================
echo Création du serveur IA
echo ================================

REM Création du script Python
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

exit /b 0
