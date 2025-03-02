"""
Gestion du modèle d'IA pour le serveur d'inférence
"""
import traceback
import os
from .config import logger, DEFAULT_MODEL, FALLBACK_MODE, MODEL_LOADED, model, tokenizer, CACHE_DIR
from .system_analyzer import analyze_system_resources
from .model_download import check_model_cached, init_model_download, get_download_progress
from .model_inference import fallback_generate
from .model_config import save_model_config, load_model_config

# Variables globales modifiables
_fallback_mode = FALLBACK_MODE
_model_loaded = MODEL_LOADED

def set_fallback_mode(value):
    """Définit le mode fallback"""
    global _fallback_mode
    _fallback_mode = value
    
def reset_model_loaded():
    """Réinitialise l'état de chargement du modèle"""
    global _model_loaded
    _model_loaded = False

def lazy_load_model():
    """Charge le modèle seulement quand nécessaire"""
    global model, tokenizer, _model_loaded, _fallback_mode
    
    if _model_loaded:
        return True
        
    try:
        logger.info(f"Chargement du modèle {DEFAULT_MODEL}...")
        
        # En mode light (sans Rust), on ne charge pas réellement le modèle
        if _fallback_mode:
            logger.info("Mode léger activé: utilisation d'une API externe pour l'inférence")
            _model_loaded = True
            return True
            
        # Analyser les ressources système
        system_resources = analyze_system_resources()
        
        # Si les ressources système sont trop faibles, passer en mode fallback
        if not system_resources["can_run_local_model"]:
            logger.warning("Ressources système insuffisantes, passage en mode léger (API externe)")
            _fallback_mode = True
            _model_loaded = True
            return True
            
        # Sinon, on essaie de charger le modèle localement
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        # Vérifier si le modèle est déjà en cache
        huggingface_cache = os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub")
        model_cached = check_model_cached(DEFAULT_MODEL, huggingface_cache)
        
        # Si le modèle n'est pas en cache, proposer de le télécharger (à travers l'API)
        if not model_cached:
            logger.info(f"Modèle {DEFAULT_MODEL} non trouvé en cache")
            # On ne bloque pas ici, le téléchargement se fera lors de la première requête
            init_model_download(DEFAULT_MODEL)
            _fallback_mode = True
            _model_loaded = True
            return True
        
        # Charger le modèle avec la configuration optimale détectée
        use_gpu = system_resources.get("gpu_available", False)
        device_map = "auto" if use_gpu else "cpu"
        
        # Configuration adaptative basée sur les ressources système
        if system_resources.get("memory_available_gb", 0) < 8:
            # Configuration basse mémoire
            logger.info("Mode économie de mémoire activé")
            tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
            model = AutoModelForCausalLM.from_pretrained(
                DEFAULT_MODEL, 
                torch_dtype=torch.float16 if use_gpu else torch.float32,
                device_map=device_map,
                low_cpu_mem_usage=True,
                offload_folder="offload"
            )
        else:
            # Configuration standard
            tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
            model = AutoModelForCausalLM.from_pretrained(
                DEFAULT_MODEL, 
                torch_dtype=torch.float16 if use_gpu else torch.float32,
                device_map=device_map
            )

        logger.info(f"Modèle chargé avec succès sur {device_map}")
        _model_loaded = True
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
                    device_map="cpu",
                    low_cpu_mem_usage=True
                )
                logger.info("Modèle chargé en mode CPU avec succès")
                _model_loaded = True
                return True
            except Exception as cpu_e:
                logger.error(f"Échec du chargement en mode CPU: {str(cpu_e)}")
                
        # En cas d'erreur, on passe en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        _fallback_mode = True
        _model_loaded = True
        return True
