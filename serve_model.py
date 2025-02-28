
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

# Configuration CORS pour permettre l'accès depuis n'importe quelle origine
# En production, utilisez une liste d'origines spécifiques au lieu de "*"
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
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
    
    # Ajouter un header pour indiquer que le serveur est local
    response = await call_next(request)
    response.headers["X-FileChat-Server"] = "local"
    
    return response

# Définir le modèle à utiliser (Mistral 7B par défaut)
DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"

try:
    logger.info(f"Chargement du modèle {DEFAULT_MODEL}...")
    tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
    model = AutoModelForCausalLM.from_pretrained(DEFAULT_MODEL, torch_dtype=torch.float16, device_map="auto")
    logger.info("Modèle chargé avec succès")
except Exception as e:
    logger.error(f"Erreur lors du chargement du modèle {DEFAULT_MODEL}. Tentative avec modèle de secours: {e}")
    try:
        # Modèle de secours plus léger si Mistral échoue
        FALLBACK_MODEL = "distilgpt2"
        logger.info(f"Chargement du modèle de secours {FALLBACK_MODEL}...")
        tokenizer = AutoTokenizer.from_pretrained(FALLBACK_MODEL)
        model = AutoModelForCausalLM.from_pretrained(FALLBACK_MODEL)
        logger.info("Modèle de secours chargé avec succès")
    except Exception as fallback_error:
        logger.critical(f"Échec total du chargement des modèles: {fallback_error}")
        raise

class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 800
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    system_prompt: Optional[str] = "You are a helpful AI assistant that provides detailed and accurate information."

@app.post("/generate")
async def generate_text(input_data: GenerationInput):
    try:
        # Validation des entrées
        if not input_data.prompt or len(input_data.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Le prompt ne peut pas être vide")
            
        if input_data.max_length > 4000:
            raise HTTPException(status_code=400, detail="max_length ne peut pas dépasser 4000")
            
        if input_data.temperature < 0.0 or input_data.temperature > 2.0:
            raise HTTPException(status_code=400, detail="temperature doit être entre 0.0 et 2.0")
            
        if input_data.top_p < 0.0 or input_data.top_p > 1.0:
            raise HTTPException(status_code=400, detail="top_p doit être entre 0.0 et 1.0")
        
        logger.info(f"Génération pour le prompt: {input_data.prompt[:50]}...")
        
        # Format du prompt pour Mistral-7B-Instruct
        formatted_prompt = f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]"
        
        # Préparation des entrées pour le modèle
        inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)
        
        generation_config = {
            "max_length": inputs["input_ids"].shape[1] + input_data.max_length,
            "do_sample": True,
            "temperature": input_data.temperature,
            "top_p": input_data.top_p,
            "pad_token_id": tokenizer.eos_token_id
        }
        
        # Génération de texte
        outputs = model.generate(**inputs, **generation_config)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extraire uniquement la réponse (pas le prompt)
        result = result.split("[/INST]")[-1].strip()
        
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
        "model": DEFAULT_MODEL,
        "version": "1.1.0",
        "timestamp": datetime.now().isoformat(),
        "type": "local"
    }

@app.get("/models")
async def list_models():
    return {
        "default": DEFAULT_MODEL,
        "available": [
            {
                "id": "mistralai/Mistral-7B-Instruct-v0.1",
                "name": "Mistral 7B",
                "description": "Modèle par défaut, équilibre performances et ressources"
            },
            {
                "id": "distilgpt2",
                "name": "DistilGPT2",
                "description": "Modèle léger pour les systèmes avec ressources limitées"
            }
        ]
    }

if __name__ == "__main__":
    host = "0.0.0.0"  # Écoute sur toutes les interfaces
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Démarrage du serveur sur http://{host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")
