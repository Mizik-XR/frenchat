
"""
Gestion du modèle d'IA pour le serveur d'inférence
"""
import os
import traceback
import json
import time
import threading
from pathlib import Path
from .config import logger, DEFAULT_MODEL, FALLBACK_MODE, MODEL_LOADED, model, tokenizer, CACHE_DIR
from .system_analyzer import analyze_system_resources

# Variables globales pour la gestion du téléchargement
download_progress = {
    "status": "idle",  # idle, downloading, completed, error
    "model": None,
    "progress": 0,     # 0-100
    "started_at": None,
    "completed_at": None,
    "error": None,
    "size_mb": 0,
    "downloaded_mb": 0
}

# Verrou pour les opérations de téléchargement
download_lock = threading.Lock()

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
            
        # Analyser les ressources système
        system_resources = analyze_system_resources()
        
        # Si les ressources système sont trop faibles, passer en mode fallback
        if not system_resources["can_run_local_model"]:
            logger.warning("Ressources système insuffisantes, passage en mode léger (API externe)")
            global FALLBACK_MODE
            FALLBACK_MODE = True
            MODEL_LOADED = True
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
            FALLBACK_MODE = True
            MODEL_LOADED = True
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
                    device_map="cpu",
                    low_cpu_mem_usage=True
                )
                logger.info("Modèle chargé en mode CPU avec succès")
                MODEL_LOADED = True
                return True
            except Exception as cpu_e:
                logger.error(f"Échec du chargement en mode CPU: {str(cpu_e)}")
                
        # En cas d'erreur, on passe en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        global FALLBACK_MODE
        FALLBACK_MODE = True
        MODEL_LOADED = True
        return True

def check_model_cached(model_name, cache_dir=None):
    """Vérifie si le modèle est déjà en cache"""
    try:
        from huggingface_hub import scan_cache_dir
        
        # Utiliser le cache par défaut si non spécifié
        if not cache_dir:
            cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub")
        
        # Scanner le répertoire de cache
        if os.path.exists(cache_dir):
            cache_info = scan_cache_dir(cache_dir)
            for repo in cache_info.repos:
                if model_name in repo.repo_id:
                    return True
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du cache: {str(e)}")
    
    return False

def init_model_download(model_name):
    """Initialise le téléchargement du modèle en arrière-plan"""
    global download_progress
    
    with download_lock:
        # Vérifier si un téléchargement est déjà en cours
        if download_progress["status"] == "downloading":
            return download_progress
        
        # Initialiser l'état de téléchargement
        download_progress = {
            "status": "downloading",
            "model": model_name,
            "progress": 0,
            "started_at": time.time(),
            "completed_at": None,
            "error": None,
            "size_mb": estimate_model_size(model_name),
            "downloaded_mb": 0
        }
    
    # Lancer le téléchargement en arrière-plan
    threading.Thread(target=download_model, args=(model_name,), daemon=True).start()
    
    return download_progress

def download_model(model_name):
    """Télécharge le modèle en arrière-plan"""
    global download_progress
    
    try:
        # Créer le répertoire de cache si nécessaire
        os.makedirs(CACHE_DIR, exist_ok=True)
        
        # Utiliser huggingface_hub pour le téléchargement
        from huggingface_hub import snapshot_download
        from huggingface_hub.utils import ProgressCallback
        
        class DownloadProgressCallback(ProgressCallback):
            def __init__(self):
                super().__init__()
                self.last_progress = 0
                
            def __call__(self, progress, total, step=None, desc=None):
                # Mise à jour du progrès global avec une protection contre les valeurs invalides
                if total > 0:
                    progress_percent = min(100, int((progress / total) * 100))
                    
                    # Mettre à jour uniquement si le progrès a significativement changé
                    if progress_percent - self.last_progress >= 2:
                        with download_lock:
                            download_progress["progress"] = progress_percent
                            download_progress["downloaded_mb"] = progress / (1024 * 1024)
                        self.last_progress = progress_percent
                        
                        # Log périodique
                        if progress_percent % 10 == 0:
                            logger.info(f"Téléchargement du modèle {model_name}: {progress_percent}%")
        
        # Télécharger le modèle avec callback de progression
        snapshot_download(
            repo_id=model_name,
            local_dir=os.path.join(CACHE_DIR, "models", model_name.replace("/", "--")),
            local_dir_use_symlinks=False,
            resume_download=True,
            progress_callback=DownloadProgressCallback()
        )
        
        # Téléchargement réussi
        with download_lock:
            download_progress["status"] = "completed"
            download_progress["progress"] = 100
            download_progress["completed_at"] = time.time()
        
        logger.info(f"Téléchargement du modèle {model_name} terminé avec succès")
        
        # Réinitialiser le mode fallback pour utiliser le modèle local
        global FALLBACK_MODE
        FALLBACK_MODE = False
        
        # Libérer la mémoire
        global MODEL_LOADED
        MODEL_LOADED = False
        
    except Exception as e:
        error_msg = f"Erreur lors du téléchargement du modèle: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        
        with download_lock:
            download_progress["status"] = "error"
            download_progress["error"] = str(e)
            download_progress["completed_at"] = time.time()

def get_download_progress():
    """Retourne l'état actuel du téléchargement"""
    with download_lock:
        return dict(download_progress)

def estimate_model_size(model_name):
    """Estime la taille du modèle en MB"""
    # Estimation basée sur des tailles connues
    model_sizes = {
        "mistralai/Mistral-7B-Instruct-v0.1": 13000,  # ~13 GB
        "mistralai/Mixtral-8x7B-Instruct-v0.1": 26000,  # ~26 GB
        "meta-llama/Llama-2-7b-chat-hf": 13500,  # ~13.5 GB
    }
    
    # Tailles par défaut basées sur le nom du modèle
    if "7b" in model_name.lower() or "7B" in model_name:
        return model_sizes.get(model_name, 14000)  # ~14 GB par défaut
    elif "13b" in model_name.lower() or "13B" in model_name:
        return 25000  # ~25 GB
    elif "70b" in model_name.lower() or "70B" in model_name:
        return 140000  # ~140 GB
    
    # Valeur par défaut conservative
    return model_sizes.get(model_name, 15000)  # ~15 GB par défaut

async def fallback_generate(input_data):
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
    
    return {
        "default_model": DEFAULT_MODEL,
        "config": {}
    }
