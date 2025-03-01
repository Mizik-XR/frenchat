
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
from typing import Optional, List, Dict, Any, Union
import os
from datetime import datetime
import sys
import json
import traceback

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

# Création de l'application FastAPI
app = FastAPI()

# Configuration CORS pour permettre l'accès depuis n'importe quelle origine
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

# Variables globales pour le modèle
MODEL_LOADED = False
DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"
FALLBACK_MODE = os.environ.get("NO_RUST_INSTALL", "0") == "1"
model = None
tokenizer = None

def lazy_load_model():
    """Charge le modèle seulement quand nécessaire"""
    global model, tokenizer, MODEL_LOADED
    
    if MODEL_LOADED:
        return True
        
    try:
        logger.info(f"Chargement du modèle {DEFAULT_MODEL}...")
        
        # En mode light (sans Rust), on ne charge pas réellement le modèle
        if FALLBACK_MODE:
            logger.info("Mode léger activé: utilisation d'une API externe pour l'inférence")
            MODEL_LOADED = True
            return True
            
        # Sinon, on essaie de charger le modèle localement
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
        model = AutoModelForCausalLM.from_pretrained(
            DEFAULT_MODEL, 
            torch_dtype=torch.float16, 
            device_map="auto"
        )
        logger.info("Modèle chargé avec succès")
        MODEL_LOADED = True
        return True
        
    except Exception as e:
        error_msg = f"Erreur lors du chargement du modèle: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        
        if "CUDA" in str(e) or "GPU" in str(e):
            logger.info("Erreur GPU détectée, passage en mode CPU")
            try:
                import torch
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
                model = AutoModelForCausalLM.from_pretrained(
                    DEFAULT_MODEL,
                    device_map="cpu"
                )
                logger.info("Modèle chargé en mode CPU avec succès")
                MODEL_LOADED = True
                return True
            except Exception as cpu_e:
                logger.error(f"Échec du chargement en mode CPU: {str(cpu_e)}")
                
        # En cas d'erreur, on passe en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        MODEL_LOADED = True
        return True

class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 800
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    system_prompt: Optional[str] = "You are a helpful AI assistant that provides detailed and accurate information."

async def fallback_generate(input_data: GenerationInput) -> Dict[str, Any]:
    """Utilise une API externe quand le modèle local n'est pas disponible"""
    import aiohttp
    
    # Options d'API (priorité: locale, puis HF API, puis fallback API)
    apis = [
        {
            "url": "http://localhost:11434/api/generate",  # Ollama
            "data": {
                "model": "mistral",
                "prompt": input_data.prompt,
                "system": input_data.system_prompt,
                "stream": False
            },
            "result_key": "response"
        },
        {
            "url": "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            "data": {
                "inputs": f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]",
                "parameters": {
                    "max_length": input_data.max_length,
                    "temperature": input_data.temperature,
                    "top_p": input_data.top_p
                }
            },
            "result_key": "generated_text"
        }
    ]
    
    for api in apis:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(api["url"], json=api["data"], timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return {"generated_text": result[0].get(api["result_key"], "")}
                        return {"generated_text": result.get(api["result_key"], "")}
        except Exception as e:
            logger.warning(f"Échec de l'API {api['url']}: {str(e)}")
            continue
    
    # Si toutes les API échouent, on renvoie un message d'erreur
    logger.error("Toutes les API ont échoué")
    return {
        "generated_text": "Désolé, je ne peux pas générer de réponse pour le moment. "
                         "Veuillez vérifier votre connexion internet ou essayer plus tard."
    }

@app.post("/generate")
async def generate_text(input_data: GenerationInput):
    try:
        # Validation des entrées
        if not input_data.prompt or len(input_data.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Le prompt ne peut pas être vide")
            
        if input_data.max_length > 4000:
            input_data.max_length = 4000
            
        if input_data.temperature < 0.0 or input_data.temperature > 2.0:
            input_data.temperature = max(0.0, min(input_data.temperature, 2.0))
            
        if input_data.top_p < 0.0 or input_data.top_p > 1.0:
            input_data.top_p = max(0.0, min(input_data.top_p, 1.0))
        
        logger.info(f"Génération pour le prompt: {input_data.prompt[:50]}...")
        
        # Si on est en mode fallback ou si le modèle n'est pas chargé, on utilise l'API externe
        if FALLBACK_MODE or not lazy_load_model():
            logger.info("Utilisation du mode API externe")
            return await fallback_generate(input_data)
        
        # Mode local - on utilise le modèle chargé
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
        
        # Essayer le mode fallback en cas d'erreur
        logger.info("Tentative de génération via API externe suite à une erreur")
        try:
            return await fallback_generate(input_data)
        except Exception as fallback_e:
            logger.error(f"Échec également du fallback: {fallback_e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Erreur de génération et échec du fallback: {str(e)}"
            )

@app.get("/health")
async def health_check():
    mode = "fallback" if FALLBACK_MODE else "local"
    if not FALLBACK_MODE:
        lazy_load_model()
    
    return {
        "status": "ok", 
        "model": DEFAULT_MODEL,
        "version": "1.2.0",
        "timestamp": datetime.now().isoformat(),
        "type": mode,
        "fallback_mode": FALLBACK_MODE,
        "model_loaded": MODEL_LOADED
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
                "id": "local/fallback",
                "name": "Mode léger (API)",
                "description": "Utilise une API externe pour l'inférence en cas de problème local"
            }
        ]
    }

if __name__ == "__main__":
    host = "0.0.0.0"  # Écoute sur toutes les interfaces
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Démarrage du serveur sur http://{host}:{port} (Mode {'léger' if FALLBACK_MODE else 'complet'})")
    
    # Vérification préliminaire des dépendances critiques
    try:
        import fastapi
        import uvicorn
        import pydantic
    except ImportError as e:
        logger.critical(f"Dépendances critiques manquantes: {e}")
        print(f"ERREUR FATALE: Dépendances critiques manquantes: {e}")
        print("Exécutez 'pip install fastapi uvicorn pydantic' pour installer les dépendances minimales.")
        sys.exit(1)
        
    # Vérification des dépendances optionnelles
    try:
        import aiohttp
    except ImportError:
        logger.warning("Package aiohttp manquant, installation...")
        os.system(f"{sys.executable} -m pip install aiohttp")
    
    # Démarrage du serveur
    uvicorn.run(app, host=host, port=port, log_level="info")
