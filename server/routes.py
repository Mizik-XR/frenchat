
# Laissons le code existant mais ajoutons la route /health
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import traceback
import time
import json
import os

from .config import logger, MODEL_LOADED
from .model_manager import lazy_load_model
from .model_inference import fallback_generate
from .model_download import get_download_progress
from .model_config import save_model_config, load_model_config

router = APIRouter()

class GenerationInput(BaseModel):
    prompt: str = Field(..., description="Texte d'entrée pour la génération")
    system_prompt: str = Field("Tu es un assistant IA utile et concis.", description="Instructions système pour le modèle")
    max_length: int = Field(1000, description="Longueur maximale de la sortie")
    temperature: float = Field(0.7, description="Température pour la génération (0.1-1.0)")
    top_p: float = Field(0.9, description="Valeur top_p pour la génération (0.1-1.0)")

class ModelConfigInput(BaseModel):
    model_name: str = Field(..., description="Nom du modèle à configurer")
    config: dict = Field({}, description="Configuration supplémentaire")

@router.get("/health")
async def get_health():
    """Endpoint simple pour vérifier que le serveur est en ligne"""
    return {"status": "ok", "message": "Service is running"}

@router.get("/status")
async def get_status():
    """Retourne l'état du serveur et du modèle"""
    try:
        # Vérifier si le modèle est chargé
        model_status = "loaded" if MODEL_LOADED else "not_loaded"
        
        # Obtenir l'état du téléchargement si en cours
        download_status = get_download_progress()
        
        return {
            "status": "ok",
            "model_status": model_status,
            "download_status": download_status
        }
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du statut: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/generate")
async def generate_text(input_data: GenerationInput):
    """Génère du texte à partir d'un prompt"""
    try:
        # Charger le modèle si nécessaire
        if not lazy_load_model():
            raise HTTPException(status_code=500, detail="Impossible de charger le modèle")
        
        # Utiliser le mode fallback si activé
        result = await fallback_generate(input_data)
        
        return result
    except Exception as e:
        error_msg = f"Erreur lors de la génération: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/config/model")
async def configure_model(config_data: ModelConfigInput):
    """Configure le modèle à utiliser"""
    try:
        # Enregistrer la configuration
        success = save_model_config(config_data.model_name, config_data.config)
        
        if not success:
            raise HTTPException(status_code=500, detail="Impossible d'enregistrer la configuration")
        
        return {"status": "ok", "message": f"Configuration du modèle {config_data.model_name} enregistrée"}
    except Exception as e:
        error_msg = f"Erreur lors de la configuration: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/config/model")
async def get_model_config():
    """Récupère la configuration actuelle du modèle"""
    try:
        config = load_model_config()
        return config
    except Exception as e:
        error_msg = f"Erreur lors de la récupération de la configuration: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/download/status")
async def download_status():
    """Récupère l'état du téléchargement du modèle"""
    try:
        status = get_download_progress()
        return status
    except Exception as e:
        error_msg = f"Erreur lors de la récupération de l'état du téléchargement: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
