
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
from typing import Optional, List
import os
from datetime import datetime

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

# Création de l'application FastAPI
app = FastAPI()

# Configuration CORS sécurisée
# En production, utilisez une liste d'origines spécifiques au lieu de "*"
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8080").split(",")
ALLOWED_METHODS = ["GET", "POST", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Client-Info"]

# Ajout du middleware CORS avec configuration sécurisée
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
    max_age=600,  # Cache la prévalidation CORS pendant 10 minutes
)

# Middleware pour limiter le débit des requêtes (rate limiting simple)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Dans une implémentation complète, utilisez Redis ou autre pour stocker les compteurs
    # Cette implémentation simplifiée est pour démonstration
    client_host = request.client.host
    current_time = datetime.now()
    
    # Journalisation des requêtes pour analyse
    logger.info(f"Requête de {client_host} à {request.url.path} à {current_time}")
    
    # Continuer avec la requête
    response = await call_next(request)
    
    # Pour une implémentation complète de rate limiting:
    # 1. Vérifier si l'IP a dépassé la limite (ex: 20 req/min)
    # 2. Si oui, renvoyer 429 Too Many Requests
    # 3. Sinon, incrémenter le compteur et poursuivre
    
    return response

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
        # Validation des entrées
        if not input_data.prompt or len(input_data.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Le prompt ne peut pas être vide")
            
        if input_data.max_length > 2000:
            raise HTTPException(status_code=400, detail="max_length ne peut pas dépasser 2000")
            
        if input_data.temperature < 0.0 or input_data.temperature > 2.0:
            raise HTTPException(status_code=400, detail="temperature doit être entre 0.0 et 2.0")
            
        if input_data.top_p < 0.0 or input_data.top_p > 1.0:
            raise HTTPException(status_code=400, detail="top_p doit être entre 0.0 et 1.0")
        
        logger.info(f"Génération pour le prompt: {input_data.prompt[:50]}...")
        
        # Préparation des entrées pour le modèle
        inputs = tokenizer(input_data.prompt, return_tensors="pt")
        
        generation_config = {
            "max_length": input_data.max_length,
            "do_sample": True,
            "temperature": input_data.temperature,
            "top_p": input_data.top_p
        }
        
        # Génération de texte
        outputs = model.generate(**inputs, **generation_config)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Génération réussie, longueur: {len(result)}")
        
        return {"generated_text": result}
    except HTTPException as he:
        # Relancer les exceptions HTTP déjà formatées
        raise he
    except Exception as e:
        # Journal détaillé des erreurs pour faciliter le débogage
        logger.error(f"Erreur lors de la génération: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "model": "distilgpt2",
        "version": "1.0.1",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    host = "0.0.0.0"  # Écoute sur toutes les interfaces
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Démarrage du serveur sur http://{host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")
