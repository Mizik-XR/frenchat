
"""
Module for handling model downloads
"""
import os
import time
import threading
import traceback
from pathlib import Path
from .config import logger, DEFAULT_MODEL, CACHE_DIR

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
        from .model_manager import set_fallback_mode, reset_model_loaded
        set_fallback_mode(False)
        reset_model_loaded()
        
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
