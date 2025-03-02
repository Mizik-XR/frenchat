
"""
Module pour la gestion de la configuration des modèles
"""
import os
import json
from .config import logger, CACHE_DIR

def save_model_config(model_name, config=None):
    """Enregistre la configuration du modèle"""
    config_path = os.path.join(CACHE_DIR, "model_config.json")
    
    try:
        # Charger la configuration existante si elle existe
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        else:
            existing_config = {}
        
        # Mettre à jour avec la nouvelle configuration
        existing_config["default_model"] = model_name
        if config:
            existing_config["config"] = config
        
        # Sauvegarder la configuration
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(existing_config, f, indent=2)
            
        logger.info(f"Configuration du modèle {model_name} enregistrée")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement de la configuration: {str(e)}")
        return False

def load_model_config():
    """Charge la configuration du modèle"""
    config_path = os.path.join(CACHE_DIR, "model_config.json")
    
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Erreur lors du chargement de la configuration: {str(e)}")
    
    # Retourner la configuration par défaut
    from .config import DEFAULT_MODEL
    return {
        "default_model": DEFAULT_MODEL,
        "config": {}
    }
