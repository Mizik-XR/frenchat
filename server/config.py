
"""
Configuration du serveur d'inférence IA
"""
import os
import logging
from pathlib import Path

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("filechat_server")

# Constantes de configuration
DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"
FALLBACK_MODE = os.environ.get("NO_RUST_INSTALL", "0") == "1"
CACHE_ENABLED = os.environ.get("ENABLE_CACHE", "1") == "1"

# Chemins pour le cache
SERVER_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = SERVER_DIR.parent
CACHE_DIR = os.path.join(ROOT_DIR, "cache")
CACHE_DB_PATH = os.path.join(CACHE_DIR, "response_cache.db")
CACHE_EXPIRY = 60 * 60 * 24 * 7  # 7 jours par défaut

# Configuration CORS
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
ALLOWED_METHODS = ["GET", "POST", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Client-Info"]

# Configuration serveur
HOST = "0.0.0.0"  # Écoute sur toutes les interfaces
PORT = int(os.environ.get("PORT", 8000))

# État global
MODEL_LOADED = False
model = None
tokenizer = None

# Flag pour vérifier si psutil est disponible
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("psutil n'est pas installé. L'analyse des ressources système sera limitée.")
