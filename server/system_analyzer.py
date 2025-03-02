
"""
Analyse des ressources système pour le serveur d'inférence IA
"""
from .config import logger
from .gpu_detector import detect_gpu
from .system_resources import analyze_memory_cpu
from .system_capability import calculate_system_score, assess_model_capability, get_platform_info

def analyze_system_resources():
    """
    Analyse les ressources système et détermine si le système peut exécuter un modèle d'IA local
    """
    # Initialize result dictionary with default values
    result = {
        "cpu_percent": None,
        "memory_available_gb": None,
        "memory_percent": None,
        "gpu_available": False,
        "gpu_info": None,
        "system_score": 0.5,  # Default score
        "can_run_local_model": True
    }
    
    try:
        # Get GPU information
        gpu_info = detect_gpu()
        result["gpu_available"] = gpu_info["available"]
        result["gpu_info"] = gpu_info
        
        # Get memory and CPU information
        resources = analyze_memory_cpu()
        result.update(resources)
        
        # Calculate system score
        result["system_score"] = calculate_system_score(
            result["cpu_percent"], 
            result["memory_percent"], 
            result["gpu_available"]
        )
        
        # Assess if system can run local model
        result["can_run_local_model"] = assess_model_capability(
            result["memory_available_gb"],
            result["cpu_percent"],
            result["system_score"]
        )
        
        # If psutil isn't available, add basic platform info
        if result["cpu_percent"] is None:
            result["platform_info"] = get_platform_info()
            
    except Exception as e:
        logger.error(f"Error during system resource analysis: {e}")
    
    return result
