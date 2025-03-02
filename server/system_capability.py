
"""
Module for assessing system capabilities for AI processing
"""
import platform
from .config import logger

def calculate_system_score(cpu_percent, memory_percent, gpu_available):
    """
    Calculate a system score based on resources
    """
    if cpu_percent is None or memory_percent is None:
        # If we couldn't get CPU or memory info, use a default score
        return 0.5
    
    cpu_score = max(0, 1 - (cpu_percent / 100))
    memory_score = max(0, 1 - (memory_percent / 100))
    # Consider GPU in system score
    gpu_score = 0.8 if gpu_available else 0.3
    
    # Calculate combined score
    return (cpu_score + memory_score + gpu_score) / 3

def assess_model_capability(memory_available_gb, cpu_percent, system_score):
    """
    Determine if the system can run a local AI model
    """
    if memory_available_gb is None or cpu_percent is None:
        # Without proper metrics, assume it's okay (will fall back if needed)
        return True
        
    return (
        memory_available_gb > 2.0 and  # At least 2GB of RAM available
        cpu_percent < 80.0 and         # CPU not too busy
        system_score > 0.3             # System score is sufficient
    )

def get_platform_info():
    """
    Get basic platform information when psutil is not available
    """
    return {
        "system": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "machine": platform.machine(),
        "processor": platform.processor()
    }
