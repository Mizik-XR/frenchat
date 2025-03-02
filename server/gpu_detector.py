
"""
Module for GPU detection and analysis
"""
from .config import logger

def detect_gpu():
    """
    Detect GPU availability and details using PyTorch and/or nvidia-smi
    """
    gpu_info = {
        "available": False,
        "name": None,
        "count": 0,
        "memory_total": 0,
        "memory_allocated": 0,
        "detection_method": None
    }
    
    try:
        # Try detecting GPU with PyTorch first
        import torch
        gpu_info["available"] = torch.cuda.is_available()
        
        if gpu_info["available"]:
            gpu_info["detection_method"] = "pytorch"
            gpu_info["name"] = torch.cuda.get_device_name(0)
            gpu_info["count"] = torch.cuda.device_count()
            gpu_info["memory_total"] = torch.cuda.get_device_properties(0).total_memory / (1024**3)  # In GB
            gpu_info["memory_allocated"] = torch.cuda.memory_allocated(0) / (1024**3)  # In GB
            logger.info(f"GPU detected via PyTorch: {gpu_info['name']}")
            return gpu_info
    except (ImportError, Exception) as e:
        logger.warning(f"Unable to check GPU via PyTorch: {str(e)}")
    
    # Fallback to nvidia-smi if PyTorch detection failed
    try:
        import subprocess
        output = subprocess.check_output(['nvidia-smi', '--query-gpu=name,memory.total', '--format=csv,noheader'])
        if output:
            gpu_info["available"] = True
            gpu_info["detection_method"] = "nvidia-smi"
            gpu_info["output"] = output.decode('utf-8').strip()
            logger.info(f"GPU detected via nvidia-smi: {gpu_info['output']}")
    except (FileNotFoundError, subprocess.SubprocessError) as gpu_e:
        logger.info(f"No NVIDIA GPU detected: {str(gpu_e)}")
    
    return gpu_info
