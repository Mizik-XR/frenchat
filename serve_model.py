
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

app = FastAPI()

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    logger.info("Chargement du modèle...")
    tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
    model = AutoModelForCausalLM.from_pretrained("distilgpt2")
    logger.info("Modèle chargé avec succès")
except Exception as e:
    logger.error(f"Erreur lors du chargement du modèle: {e}")
    raise

class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 100
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9

@app.post("/generate")
async def generate_text(input_data: GenerationInput):
    try:
        logger.info(f"Génération pour le prompt: {input_data.prompt[:50]}...")
        inputs = tokenizer(input_data.prompt, return_tensors="pt")
        
        generation_config = {
            "max_length": input_data.max_length,
            "do_sample": True,
            "temperature": input_data.temperature,
            "top_p": input_data.top_p
        }
        
        outputs = model.generate(**inputs, **generation_config)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Génération réussie, longueur: {len(result)}")
        
        return {"generated_text": result}
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": "distilgpt2"}

if __name__ == "__main__":
    logger.info("Démarrage du serveur sur http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
