
"""
Module for analyzing system memory and CPU resources
"""
from .config import logger, PSUTIL_AVAILABLE

def analyze_memory_cpu():
    """
    Analyze memory and CPU usage
    """
    resources = {
        "cpu_percent": None,
        "memory_available_gb": None,
        "memory_percent": None,
    }
    
    if PSUTIL_AVAILABLE:
        try:
            import psutil
            
            # Get CPU usage
            resources["cpu_percent"] = psutil.cpu_percent(interval=0.5)
            
            # Get memory usage
            memory = psutil.virtual_memory()
            resources["memory_available_gb"] = memory.available / (1024 * 1024 * 1024)
            resources["memory_percent"] = memory.percent
            
        except Exception as e:
            logger.error(f"Error analyzing memory and CPU: {str(e)}")
    else:
        logger.info("psutil not available, skipping detailed memory and CPU analysis")
    
    return resources
