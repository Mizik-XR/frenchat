
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
        "system_score": 0.5,  # Score par défaut
        "can_run_local_model": True
    }
    
    try:
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
            result["system_score"] = (cpu_score + memory_score) / 2
            
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
