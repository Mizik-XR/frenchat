
"""
Configuration pour le serveur d'inférence
"""
import os
import logging
import json
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ia-server")

# Initialisation des objets globaux
model = None
tokenizer = None
MODEL_LOADED = False
FALLBACK_MODE = False  # Mode léger pour le démarrage rapide sans modèle local

# Configuration des chemins
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HOME_DIR = os.path.expanduser("~")
APP_DATA = os.environ.get("APPDATA") or HOME_DIR
CACHE_DIR = os.path.join(APP_DATA, "filechat")
MODELS_DIR = os.path.join(CACHE_DIR, "models")
LOG_DIR = os.path.join(CACHE_DIR, "logs")

# Créer les répertoires s'ils n'existent pas
for dir_path in [CACHE_DIR, MODELS_DIR, LOG_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# Modèle par défaut (peut être modifié via la configuration)
DEFAULT_MODEL = "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"

# Configuration du cache
CACHE_ENABLED = True
CACHE_DB_PATH = os.path.join(CACHE_DIR, "response_cache.db")
CACHE_EXPIRY = 86400  # TTL par défaut: 24 heures en secondes

# Fonctions utilitaires
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

# Tentative de chargement de la configuration
model_config = load_model_config()
if "default_model" in model_config:
    DEFAULT_MODEL = model_config["default_model"]

# Log de la configuration
logger.info(f"Démarrage du serveur avec le modèle: {DEFAULT_MODEL}")
logger.info(f"Répertoire de cache: {CACHE_DIR}")
logger.info(f"Cache SQLite: {CACHE_ENABLED}, TTL: {CACHE_EXPIRY}s")
