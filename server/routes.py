
"""
Configuration des routes API pour le serveur d'inférence IA
"""
import os
import json
import traceback
import time
from typing import Optional, Dict, List, Any, Union
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Response, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import asyncio
import sys

# Import des modules internes
from .config import logger, DEFAULT_MODEL, FALLBACK_MODE, MODEL_LOADED
from .model_manager import lazy_load_model, get_download_progress, init_model_download, fallback_generate
from .system_analyzer import analyze_system_resources
from .cache_manager import init_cache, check_cache, update_cache, generate_cache_id, get_cache_stats, clean_expired_entries, toggle_compression, set_cache_ttl, purge_cache

# Définitions Pydantic pour validation des requêtes
class TextGenerationRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante."
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    max_length: Optional[int] = 800
    stream: Optional[bool] = False

class ModelDownloadRequest(BaseModel):
    model: str
    consent: bool = False

def init_app():
    """Initialise l'application FastAPI avec middlewares et routes"""
    app = FastAPI(
        title="FileChat Inference API",
        description="API d'inférence IA pour FileChat",
        version="1.0.0"
    )
    
    # Configuration CORS pour permettre les requêtes depuis les origines autorisées
    allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080,*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialisation du cache SQLite
    init_cache()
    
    @app.get("/health")
    async def health_check():
        """Point de terminaison pour vérifier la santé du serveur"""
        return {
            "status": "ok",
            "version": "1.0.0",
            "model": DEFAULT_MODEL,
            "model_loaded": MODEL_LOADED,
            "fallback_mode": FALLBACK_MODE,
            "timestamp": datetime.now().isoformat(),
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        }
    
    @app.get("/system-info")
    async def system_info():
        """Retourne des informations sur le système et ses capacités"""
        return analyze_system_resources()
    
    @app.post("/generate")
    async def generate_text(input_data: TextGenerationRequest):
        """Génère du texte à partir d'un prompt"""
        cache_id = generate_cache_id(
            input_data.prompt, 
            input_data.system_prompt, 
            DEFAULT_MODEL, 
            input_data.temperature, 
            input_data.top_p, 
            input_data.max_length
        )
        
        # Vérifier le cache avant de générer
        cached_response = check_cache(cache_id)
        if cached_response:
            # Log pour le debugging
            logger.debug(f"Résultat trouvé dans le cache pour: {input_data.prompt[:50]}...")
            return {"generated_text": cached_response, "cached": True}
        
        # Si le modèle n'est pas chargé, tenter de le charger
        if not MODEL_LOADED:
            lazy_load_model()
        
        # Si le mode fallback est activé, utiliser l'API externe
        if FALLBACK_MODE:
            start_time = time.time()
            result = await fallback_generate(input_data)
            end_time = time.time()
            
            # Mise à jour du cache
            update_cache(
                cache_id,
                input_data.prompt,
                input_data.system_prompt,
                DEFAULT_MODEL,
                result["generated_text"],
                input_data.temperature,
                input_data.top_p,
                input_data.max_length
            )
            
            # Log de performance
            logger.info(f"Génération via API externe en {(end_time - start_time):.2f}s")
            
            result["cached"] = False
            return result
        
        # Sinon, utiliser le modèle local
        try:
            import torch
            
            input_text = f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]"
            
            # Tokenisation
            input_ids = tokenizer.encode(input_text, return_tensors="pt")
            
            # Génération
            start_time = time.time()
            
            with torch.no_grad():
                output = model.generate(
                    input_ids,
                    max_new_tokens=input_data.max_length,
                    do_sample=True,
                    temperature=input_data.temperature,
                    top_p=input_data.top_p,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            # Décodage
            generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
            
            # Extraction de la réponse (après [/INST])
            response_text = generated_text.split("[/INST]")[-1].strip()
            
            end_time = time.time()
            
            # Mise à jour du cache
            update_cache(
                cache_id,
                input_data.prompt,
                input_data.system_prompt,
                DEFAULT_MODEL,
                response_text,
                input_data.temperature,
                input_data.top_p,
                input_data.max_length
            )
            
            # Log de performance
            logger.info(f"Génération locale en {(end_time - start_time):.2f}s")
            
            return {"generated_text": response_text, "cached": False}
            
        except Exception as e:
            error_msg = f"Erreur lors de la génération: {str(e)}"
            logger.error(error_msg)
            traceback.print_exc()
            
            # Fallback vers l'API externe
            logger.info("Fallback vers API externe après erreur locale")
            result = await fallback_generate(input_data)
            
            # Mise à jour du cache
            update_cache(
                cache_id,
                input_data.prompt,
                input_data.system_prompt,
                DEFAULT_MODEL,
                result["generated_text"],
                input_data.temperature,
                input_data.top_p,
                input_data.max_length
            )
            
            result["cached"] = False
            result["fallback"] = True
            return result

    @app.get("/download-progress")
    async def download_progress():
        """Retourne l'état du téléchargement du modèle en cours"""
        return get_download_progress()
    
    @app.post("/download-model")
    async def download_model(request: ModelDownloadRequest):
        """Démarre le téléchargement d'un modèle"""
        if not request.consent:
            raise HTTPException(
                status_code=400,
                detail="Vous devez consentir au téléchargement du modèle"
            )
        
        # Estimation de la taille du modèle
        progress = init_model_download(request.model)
        return {
            "status": "downloading",
            "model": request.model,
            "progress": 0,
            "estimated_size_mb": progress["size_mb"]
        }
    
    @app.get("/cache-stats")
    async def cache_stats():
        """Retourne des statistiques sur le cache"""
        return get_cache_stats()
    
    @app.post("/cache/clean")
    async def clean_cache(background_tasks: BackgroundTasks):
        """Nettoie le cache des entrées expirées"""
        background_tasks.add_task(clean_expired_entries)
        return {"status": "cleaning", "message": "Nettoyage du cache en cours"}
    
    @app.post("/cache/toggle-compression")
    async def set_cache_compression(enabled: bool = True):
        """Active ou désactive la compression du cache"""
        success = toggle_compression(enabled)
        return {"status": "ok" if success else "error", "compression_enabled": enabled}
    
    @app.post("/cache/set-ttl")
    async def update_cache_ttl(ttl_seconds: int):
        """Définit la durée de vie (TTL) des entrées du cache"""
        if ttl_seconds <= 0:
            raise HTTPException(
                status_code=400,
                detail="La durée de vie doit être positive"
            )
        
        success = set_cache_ttl(ttl_seconds)
        return {"status": "ok" if success else "error", "ttl_seconds": ttl_seconds}
    
    @app.post("/cache/purge")
    async def clear_cache():
        """Vide complètement le cache"""
        success = purge_cache()
        return {"status": "ok" if success else "error", "message": "Cache vidé avec succès"}
    
    return app
