
"""
Analyse des ressources système pour le serveur d'inférence IA
"""
from .config import logger, PSUTIL_AVAILABLE

def analyze_system_resources():
    """
    Analyse les ressources système et détermine si le système peut exécuter un modèle d'IA local
    """
    result = {
        "cpu_percent": None,
        "memory_available_gb": None,
        "memory_percent": None,
        "gpu_available": False,
        "gpu_info": None,
        "system_score": 0.5,  # Score par défaut
        "can_run_local_model": True
    }
    
    try:
        # Vérification GPU avec PyTorch si disponible
        try:
            import torch
            result["gpu_available"] = torch.cuda.is_available()
            
            if result["gpu_available"]:
                result["gpu_info"] = {
                    "name": torch.cuda.get_device_name(0),
                    "count": torch.cuda.device_count(),
                    "memory_total": torch.cuda.get_device_properties(0).total_memory / (1024**3), # En GB
                    "memory_allocated": torch.cuda.memory_allocated(0) / (1024**3) # En GB
                }
                logger.info(f"GPU détecté: {result['gpu_info']['name']}")
            else:
                logger.info("Aucun GPU compatible CUDA détecté")
        except (ImportError, Exception) as e:
            logger.warning(f"Impossible de vérifier le GPU via PyTorch: {str(e)}")
            # Tentative de détection avec NVIDIA-SMI si PyTorch n'est pas disponible
            try:
                import subprocess
                output = subprocess.check_output(['nvidia-smi', '--query-gpu=name,memory.total', '--format=csv,noheader'])
                if output:
                    result["gpu_available"] = True
                    result["gpu_info"] = {"detection_method": "nvidia-smi", "output": output.decode('utf-8').strip()}
                    logger.info(f"GPU détecté via nvidia-smi: {result['gpu_info']}")
            except (FileNotFoundError, subprocess.SubprocessError) as gpu_e:
                logger.info(f"Pas de GPU NVIDIA détecté: {str(gpu_e)}")
            
        if PSUTIL_AVAILABLE:
            import psutil
            
            # Obtenir l'utilisation CPU
            result["cpu_percent"] = psutil.cpu_percent(interval=0.5)
            
            # Obtenir l'utilisation mémoire
            memory = psutil.virtual_memory()
            result["memory_available_gb"] = memory.available / (1024 * 1024 * 1024)
            result["memory_percent"] = memory.percent
            
            # Calculer un score système (0-1)
            cpu_score = max(0, 1 - (result["cpu_percent"] / 100))
            memory_score = max(0, 1 - (memory.percent / 100))
            # Tenir compte du GPU dans le score système
            gpu_score = 0.8 if result["gpu_available"] else 0.3
            result["system_score"] = (cpu_score + memory_score + gpu_score) / 3
            
            # Vérifier si le système peut exécuter le modèle local
            result["can_run_local_model"] = (
                result["memory_available_gb"] > 2.0 and  # Au moins 2GB de RAM disponible
                result["cpu_percent"] < 80.0 and         # CPU pas trop chargé
                result["system_score"] > 0.3              # Score système suffisant
            )
        else:
            # Sans psutil, utiliser une estimation simple
            import platform
            result["system_info"] = platform.system()
            result["can_run_local_model"] = True  # Par défaut, autorise l'exécution locale
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse des ressources système: {e}")
    
    return result
