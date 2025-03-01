
"""
Routes FastAPI pour le serveur d'inférence IA
"""
import os
import time
import asyncio
import random
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from fastapi import FastAPI, Request, Response, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .config import MODEL_LOADED, DEFAULT_MODEL, FALLBACK_MODE, logger, CACHE_ENABLED, CACHE_DIR
from .model_manager import lazy_load_model, init_model_download, get_download_progress, fallback_generate
from .system_analyzer import analyze_system_resources
from .cache_manager import (
    init_cache, check_cache, update_cache, generate_cache_id, 
    get_cache_stats, clean_expired_entries, toggle_compression, 
    set_cache_ttl, purge_cache
)

# Initialisation du cache
init_cache()

# Modèles de données
class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 800
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    system_prompt: Optional[str] = "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante."
    use_cache: Optional[bool] = True

class ModelDownloadRequest(BaseModel):
    model: str
    consent: bool = False

class HealthResponse(BaseModel):
    status: str
    model: str
    model_loaded: bool
    fallback_mode: bool
    system_info: dict
    timestamp: str

app = FastAPI(title="AI Model Server")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour le développement, à restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Route pour vérifier l'état du serveur"""
    system_resources = analyze_system_resources()
    
    try:
        # Essayer de charger le modèle paresseusement
        if not FALLBACK_MODE and not MODEL_LOADED:
            lazy_load_model()
    except Exception as e:
        logger.error(f"Erreur lors du chargement du modèle pour le health check: {str(e)}")
    
    return HealthResponse(
        status="ok",
        model=DEFAULT_MODEL,
        model_loaded=MODEL_LOADED,
        fallback_mode=FALLBACK_MODE,
        system_info=system_resources,
        timestamp=datetime.now().isoformat()
    )

@app.post("/generate")
async def generate_text(input_data: TextGenerationRequest):
    """Génère du texte à partir d'un prompt"""
    start_time = time.time()
    
    # Vérifier si la réponse est dans le cache
    if CACHE_ENABLED and input_data.use_cache:
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
            logger.info(f"Réponse récupérée du cache en {time.time() - start_time:.2f}s")
            return {"generated_text": cached_response, "from_cache": True}
    
    # Si nous sommes en mode fallback, utiliser l'API externe
    if FALLBACK_MODE:
        logger.info("Génération via le service externe (mode fallback)")
        try:
            response = await fallback_generate(input_data)
            
            # Mettre en cache la réponse si la mise en cache est activée
            if CACHE_ENABLED and input_data.use_cache and response.get("generated_text"):
                cache_id = generate_cache_id(
                    input_data.prompt, 
                    input_data.system_prompt, 
                    DEFAULT_MODEL, 
                    input_data.temperature, 
                    input_data.top_p, 
                    input_data.max_length
                )
                update_cache(
                    cache_id, 
                    input_data.prompt, 
                    input_data.system_prompt, 
                    DEFAULT_MODEL, 
                    response["generated_text"], 
                    input_data.temperature, 
                    input_data.top_p, 
                    input_data.max_length
                )
            
            logger.info(f"Génération terminée en {time.time() - start_time:.2f}s")
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération en mode fallback: {str(e)}")
            return {"error": f"Erreur lors de la génération: {str(e)}"}
    
    # Essayer de charger le modèle paresseusement
    if not MODEL_LOADED:
        if not lazy_load_model():
            logger.error("Impossible de charger le modèle")
            return {"error": "Impossible de charger le modèle"}
    
    try:
        from .config import model, tokenizer
        import torch
        
        # Créer le prompt complet avec le contexte système si fourni
        full_prompt = f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]"
        
        # Tokeniser l'entrée
        inputs = tokenizer(full_prompt, return_tensors="pt")
        
        # Générer la réponse
        with torch.no_grad():
            output_sequences = model.generate(
                **inputs,
                max_length=input_data.max_length,
                temperature=input_data.temperature,
                top_p=input_data.top_p,
            )
        
        # Décoder la sortie
        generated_text = tokenizer.decode(output_sequences[0], skip_special_tokens=True)
        
        # Nettoyer la sortie pour extraire uniquement la réponse du modèle
        if "[/INST]" in generated_text:
            generated_text = generated_text.split("[/INST]", 1)[1].strip()
        
        # Mettre en cache la réponse si la mise en cache est activée
        if CACHE_ENABLED and input_data.use_cache:
            cache_id = generate_cache_id(
                input_data.prompt, 
                input_data.system_prompt, 
                DEFAULT_MODEL, 
                input_data.temperature, 
                input_data.top_p, 
                input_data.max_length
            )
            update_cache(
                cache_id, 
                input_data.prompt, 
                input_data.system_prompt, 
                DEFAULT_MODEL, 
                generated_text, 
                input_data.temperature, 
                input_data.top_p, 
                input_data.max_length
            )
        
        logger.info(f"Génération terminée en {time.time() - start_time:.2f}s")
        return {"generated_text": generated_text, "from_cache": False}
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {str(e)}")
        return {"error": f"Erreur lors de la génération: {str(e)}"}

@app.post("/download-model")
async def download_model(request: ModelDownloadRequest):
    """Démarre le téléchargement d'un modèle en arrière-plan"""
    if not request.consent:
        raise HTTPException(status_code=400, detail="Le consentement pour le téléchargement est requis")
    
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR, exist_ok=True)
    
    # Vérifier le statut actuel du téléchargement
    current_status = get_download_progress()
    if current_status["status"] == "downloading":
        return current_status
    
    # Initialiser le téléchargement en arrière-plan
    progress = init_model_download(request.model)
    return progress

@app.get("/download-progress")
async def check_download_progress():
    """Récupère l'état actuel du téléchargement"""
    return get_download_progress()

@app.get("/cache-stats")
async def cache_statistics():
    """Récupère les statistiques du cache"""
    return get_cache_stats()

@app.post("/cache-clear")
async def clear_cache():
    """Vide complètement le cache"""
    if purge_cache():
        return {"status": "success", "message": "Cache vidé avec succès"}
    return {"status": "error", "message": "Erreur lors de la purge du cache"}

@app.post("/cache-config")
async def configure_cache(ttl: Optional[int] = None, compression: Optional[bool] = None):
    """Configure les paramètres du cache"""
    results = {}
    
    if ttl is not None:
        if ttl > 0:
            if set_cache_ttl(ttl):
                results["ttl"] = {"status": "success", "value": ttl}
            else:
                results["ttl"] = {"status": "error", "message": "Erreur lors de la modification du TTL"}
        else:
            results["ttl"] = {"status": "error", "message": "Le TTL doit être positif"}
    
    if compression is not None:
        if toggle_compression(compression):
            results["compression"] = {"status": "success", "enabled": compression}
        else:
            results["compression"] = {"status": "error", "message": "Erreur lors de la modification de la compression"}
    
    # Si aucun paramètre n'a été spécifié, retourner les paramètres actuels
    if not results:
        return get_cache_stats()
    
    return results

@app.get("/models")
async def list_available_models():
    """Liste les modèles disponibles pour téléchargement ou utilisation"""
    # Cette liste peut être étendue ou rendue dynamique à l'avenir
    available_models = [
        {
            "id": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
            "name": "Mistral 7B Instruct",
            "description": "Modèle de base recommandé (environ 4GB)"
        },
        {
            "id": "TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF",
            "name": "Mixtral 8x7B",
            "description": "Modèle plus puissant mais plus lourd (environ 15GB)"
        }
    ]
    
    return {"available": available_models}

@app.post("/clean-expired-cache")
async def clean_cache(background_tasks: BackgroundTasks):
    """Nettoie les entrées expirées du cache en arrière-plan"""
    background_tasks.add_task(clean_expired_entries)
    return {"status": "success", "message": "Nettoyage du cache en cours"}

# Route OPTIONS pour gérer les requêtes CORS préflight
@app.options("/{path:path}")
async def options_route(request: Request, path: str):
    """Gère les requêtes OPTIONS pour CORS"""
    response = Response(status_code=204)
    return response
