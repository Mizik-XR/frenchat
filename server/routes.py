"""
Routes API pour le serveur d'inférence IA
"""
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

from .config import logger, DEFAULT_MODEL, FALLBACK_MODE, MODEL_LOADED, ALLOWED_ORIGINS, ALLOWED_METHODS, ALLOWED_HEADERS
from .cache_manager import init_cache, generate_cache_id, check_cache, update_cache, get_cache_stats
from .system_analyzer import analyze_system_resources
from .model_manager import lazy_load_model, fallback_generate, get_download_progress, init_model_download, save_model_config, load_model_config

# Modèles de données
class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 800
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    system_prompt: Optional[str] = "You are a helpful AI assistant that provides detailed and accurate information."

class SystemResourcesRequest(BaseModel):
    analyzeSystem: bool = True

class ModelDownloadRequest(BaseModel):
    model: str
    consent: bool = Field(..., description="Confirmation de consentement pour le téléchargement")

# Création de l'application FastAPI
app = FastAPI()

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

@app.post("/generate")
async def generate_text(input_data: GenerationInput, background_tasks: BackgroundTasks):
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
        
        # Vérifier si la réponse est en cache
        cache_id = generate_cache_id(
            input_data.prompt, 
            input_data.system_prompt, 
            DEFAULT_MODEL, 
            input_data.temperature, 
            input_data.top_p, 
            input_data.max_length
        )
        
        cached_response = check_cache(cache_id)
        if cached_response:
            logger.info("Réponse trouvée en cache")
            return {"generated_text": cached_response}
        
        # Analyser les ressources système pour les requêtes complexes
        prompt_length = len(input_data.prompt)
        if prompt_length > 1000:
            system_resources = analyze_system_resources()
            
            # Si la requête est longue et les ressources système faibles, passer en fallback
            if prompt_length > 2000 and not system_resources["can_run_local_model"]:
                logger.info("Requête longue et ressources système insuffisantes, utilisation du fallback")
                result = await fallback_generate(input_data)
                
                # Mettre à jour le cache en arrière-plan
                background_tasks.add_task(
                    update_cache,
                    cache_id,
                    input_data.prompt,
                    input_data.system_prompt,
                    DEFAULT_MODEL,
                    result["generated_text"],
                    input_data.temperature,
                    input_data.top_p,
                    input_data.max_length
                )
                
                return result
        
        # Si on est en mode fallback ou si le modèle n'est pas chargé, on utilise l'API externe
        if FALLBACK_MODE or not lazy_load_model():
            logger.info("Utilisation du mode API externe")
            result = await fallback_generate(input_data)
            
            # Mettre à jour le cache en arrière-plan
            background_tasks.add_task(
                update_cache,
                cache_id,
                input_data.prompt,
                input_data.system_prompt,
                DEFAULT_MODEL,
                result["generated_text"],
                input_data.temperature,
                input_data.top_p,
                input_data.max_length
            )
            
            return result
        
        # Mode local - on utilise le modèle chargé
        from .config import model, tokenizer
        
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
        
        # Mettre à jour le cache en arrière-plan
        background_tasks.add_task(
            update_cache,
            cache_id,
            input_data.prompt,
            input_data.system_prompt,
            DEFAULT_MODEL,
            result,
            input_data.temperature,
            input_data.top_p,
            input_data.max_length
        )
        
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
    
    # Inclure les statistiques du cache
    cache_stats = {"enabled": True, "stats": get_cache_stats()}
    
    # Inclure les informations sur les ressources système
    system_resources = analyze_system_resources()
    
    # Inclure les informations sur le téléchargement du modèle
    download_status = get_download_progress()
    
    return {
        "status": "ok", 
        "model": DEFAULT_MODEL,
        "version": "1.3.0",
        "timestamp": datetime.now().isoformat(),
        "type": mode,
        "fallback_mode": FALLBACK_MODE,
        "model_loaded": MODEL_LOADED,
        "cache": cache_stats,
        "system_resources": system_resources,
        "download": download_status
    }

@app.get("/models")
async def list_models():
    # Charger la configuration du modèle
    model_config = load_model_config()
    default_model = model_config.get("default_model", DEFAULT_MODEL)
    
    return {
        "default": default_model,
        "available": [
            {
                "id": "mistralai/Mistral-7B-Instruct-v0.1",
                "name": "Mistral 7B",
                "description": "Modèle par défaut, équilibre performances et ressources"
            },
            {
                "id": "mistralai/Mixtral-8x7B-Instruct-v0.1",
                "name": "Mixtral 8x7B",
                "description": "Modèle plus puissant, nécessite plus de ressources"
            },
            {
                "id": "local/fallback",
                "name": "Mode léger (API)",
                "description": "Utilise une API externe pour l'inférence en cas de problème local"
            }
        ]
    }

@app.post("/analyze-system")
async def analyze_system(input_data: SystemResourcesRequest):
    """Endpoint pour analyser les ressources système sans générer de texte"""
    if input_data.analyzeSystem:
        resources = analyze_system_resources()
        
        # Ajouter des conseils basés sur les résultats
        if resources["can_run_local_model"]:
            resources["recommendation"] = "Votre système peut exécuter le modèle localement."
        else:
            resources["recommendation"] = "Votre système est limité. Utilisation du mode cloud recommandée."
        
        return resources
    
    return {"error": "Requête invalide"}

@app.get("/cache-stats")
async def get_cache_statistics():
    """Endpoint pour obtenir les statistiques du cache"""
    return get_cache_stats()

@app.get("/download-progress")
async def get_model_download_progress():
    """Endpoint pour obtenir l'état du téléchargement du modèle"""
    return get_download_progress()

@app.post("/download-model")
async def start_model_download(request: ModelDownloadRequest):
    """Endpoint pour démarrer le téléchargement d'un modèle"""
    if not request.consent:
        raise HTTPException(
            status_code=400, 
            detail="Vous devez consentir au téléchargement du modèle"
        )
    
    # Vérifier si le modèle est valide
    valid_models = ["mistralai/Mistral-7B-Instruct-v0.1", "mistralai/Mixtral-8x7B-Instruct-v0.1"]
    if request.model not in valid_models:
        raise HTTPException(
            status_code=400, 
            detail=f"Modèle non supporté. Modèles valides: {', '.join(valid_models)}"
        )
    
    # Démarrer le téléchargement
    download_status = init_model_download(request.model)
    
    # Sauvegarder la configuration du modèle
    save_model_config(request.model)
    
    return {
        "status": "downloading",
        "model": request.model,
        "progress": download_status["progress"],
        "estimated_size_mb": download_status["size_mb"]
    }

def init_app():
    # Initialiser le cache au démarrage
    init_cache()
    return app
