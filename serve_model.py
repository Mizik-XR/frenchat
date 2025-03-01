
from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
from typing import Optional, List, Dict, Any, Union
import os
from datetime import datetime
import sys
import json
import traceback
import time
import hashlib
from pathlib import Path
import sqlite3

# Ajouter psutil pour l'analyse des ressources système (si disponible)
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("psutil n'est pas installé. L'analyse des ressources système sera limitée.")

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

# Création de l'application FastAPI
app = FastAPI()

# Configuration CORS pour permettre l'accès depuis n'importe quelle origine
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
ALLOWED_METHODS = ["GET", "POST", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Client-Info"]

# Ajout du middleware CORS avec configuration sécurisée
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
    max_age=600,  # Cache la prévalidation CORS pendant 10 minutes
)

# Middleware pour limiter le débit des requêtes (rate limiting simple)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Dans une implémentation complète, utilisez Redis ou autre pour stocker les compteurs
    # Cette implémentation simplifiée est pour démonstration
    client_host = request.client.host
    current_time = datetime.now()
    
    # Journalisation des requêtes pour analyse
    logger.info(f"Requête de {client_host} à {request.url.path} à {current_time}")
    
    # Ajouter un header pour indiquer que le serveur est local
    response = await call_next(request)
    response.headers["X-FileChat-Server"] = "local"
    
    return response

# Variables globales pour le modèle
MODEL_LOADED = False
DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"
FALLBACK_MODE = os.environ.get("NO_RUST_INSTALL", "0") == "1"
model = None
tokenizer = None

# Configuration du cache
CACHE_ENABLED = os.environ.get("ENABLE_CACHE", "1") == "1"
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
CACHE_DB_PATH = os.path.join(CACHE_DIR, "response_cache.db")
CACHE_EXPIRY = 60 * 60 * 24 * 7  # 7 jours par défaut

# Initialisation du cache SQLite
def init_cache():
    if not CACHE_ENABLED:
        return
    
    # Créer le répertoire de cache s'il n'existe pas
    os.makedirs(CACHE_DIR, exist_ok=True)
    
    # Initialiser la base de données SQLite
    conn = sqlite3.connect(CACHE_DB_PATH)
    cursor = conn.cursor()
    
    # Créer la table de cache si elle n'existe pas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS response_cache (
        id TEXT PRIMARY KEY,
        prompt TEXT,
        system_prompt TEXT,
        model TEXT,
        response TEXT,
        created_at INTEGER,
        temperature REAL,
        top_p REAL,
        max_length INTEGER
    )
    ''')
    
    # Créer la table de métadonnées pour stocker les stats et paramètres du cache
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cache_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')
    
    # Insérer/mettre à jour les paramètres par défaut s'ils n'existent pas
    cursor.execute("INSERT OR IGNORE INTO cache_metadata VALUES (?, ?)", 
                 ("cache_expiry", str(CACHE_EXPIRY)))
    cursor.execute("INSERT OR IGNORE INTO cache_metadata VALUES (?, ?)", 
                 ("hits", "0"))
    cursor.execute("INSERT OR IGNORE INTO cache_metadata VALUES (?, ?)", 
                 ("misses", "0"))
    
    conn.commit()
    conn.close()
    
    logger.info(f"Cache initialisé: {CACHE_DB_PATH}")

# Fonction pour générer un ID de cache basé sur la requête
def generate_cache_id(prompt, system_prompt, model, temperature, top_p, max_length):
    # Créer une chaîne avec tous les paramètres pertinents
    cache_string = f"{prompt}|{system_prompt}|{model}|{temperature}|{top_p}|{max_length}"
    # Générer un hash SHA-256
    return hashlib.sha256(cache_string.encode()).hexdigest()

# Fonction pour vérifier le cache
def check_cache(cache_id):
    if not CACHE_ENABLED:
        return None
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Récupérer la durée d'expiration du cache des métadonnées
        cursor.execute("SELECT value FROM cache_metadata WHERE key = ?", ("cache_expiry",))
        cache_expiry = int(cursor.fetchone()[0])
        
        # Calculer le timestamp d'expiration
        expiry_time = int(time.time()) - cache_expiry
        
        # Vérifier si l'entrée existe et n'a pas expiré
        cursor.execute(
            "SELECT response FROM response_cache WHERE id = ? AND created_at > ?", 
            (cache_id, expiry_time)
        )
        result = cursor.fetchone()
        
        if result:
            # Incrémenter le compteur de hits
            cursor.execute("UPDATE cache_metadata SET value = CAST(value AS INTEGER) + 1 WHERE key = 'hits'")
            conn.commit()
            response = result[0]
            conn.close()
            return response
        
        # Incrémenter le compteur de misses
        cursor.execute("UPDATE cache_metadata SET value = CAST(value AS INTEGER) + 1 WHERE key = 'misses'")
        conn.commit()
        conn.close()
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du cache: {e}")
        return None

# Fonction pour mettre à jour le cache
def update_cache(cache_id, prompt, system_prompt, model, response, temperature, top_p, max_length):
    if not CACHE_ENABLED:
        return
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Insérer ou remplacer l'entrée dans le cache
        cursor.execute(
            "INSERT OR REPLACE INTO response_cache VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (cache_id, prompt, system_prompt, model, response, int(time.time()), 
             temperature, top_p, max_length)
        )
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du cache: {e}")

# Fonction pour analyser les ressources système
def analyze_system_resources():
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
            FALLBACK_MODE = True
            MODEL_LOADED = True
            return True
            
        # Sinon, on essaie de charger le modèle localement
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
        model = AutoModelForCausalLM.from_pretrained(
            DEFAULT_MODEL, 
            torch_dtype=torch.float16, 
            device_map="auto"
        )
        logger.info("Modèle chargé avec succès")
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
                    device_map="cpu"
                )
                logger.info("Modèle chargé en mode CPU avec succès")
                MODEL_LOADED = True
                return True
            except Exception as cpu_e:
                logger.error(f"Échec du chargement en mode CPU: {str(cpu_e)}")
                
        # En cas d'erreur, on passe en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        FALLBACK_MODE = True
        MODEL_LOADED = True
        return True

class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 800
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    system_prompt: Optional[str] = "You are a helpful AI assistant that provides detailed and accurate information."

class SystemResourcesRequest(BaseModel):
    analyzeSystem: bool = True

async def fallback_generate(input_data: GenerationInput) -> Dict[str, Any]:
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

@app.post("/generate")
async def generate_text(input_data: GenerationInput, background_tasks: BackgroundTasks):
    try:
        # Validation des entrées
        if not input_data.prompt or len(input_data.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Le prompt ne peut pas être vide")
            
        if input_data.max_length > 4000:
            input_data.max_length = 4000
            
        if input_data.temperature < 0.0 or input_data.temperature > 2.0:
            input_data.temperature = max(0.0, min(input_data.temperature, 2.0))
            
        if input_data.top_p < 0.0 or input_data.top_p > 1.0:
            input_data.top_p = max(0.0, min(input_data.top_p, 1.0))
        
        logger.info(f"Génération pour le prompt: {input_data.prompt[:50]}...")
        
        # Vérifier si la réponse est en cache
        cache_id = generate_cache_id(
            input_data.prompt, 
            input_data.system_prompt, 
            DEFAULT_MODEL, 
            input_data.temperature, 
            input_data.top_p, 
            input_data.max_length
        )
        
        cached_response = check_cache(cache_id)
        if cached_response:
            logger.info("Réponse trouvée en cache")
            return {"generated_text": cached_response}
        
        # Analyser les ressources système pour les requêtes complexes
        prompt_length = len(input_data.prompt)
        if prompt_length > 1000:
            system_resources = analyze_system_resources()
            
            # Si la requête est longue et les ressources système faibles, passer en fallback
            if prompt_length > 2000 and not system_resources["can_run_local_model"]:
                logger.info("Requête longue et ressources système insuffisantes, utilisation du fallback")
                result = await fallback_generate(input_data)
                
                # Mettre à jour le cache en arrière-plan
                background_tasks.add_task(
                    update_cache,
                    cache_id,
                    input_data.prompt,
                    input_data.system_prompt,
                    DEFAULT_MODEL,
                    result["generated_text"],
                    input_data.temperature,
                    input_data.top_p,
                    input_data.max_length
                )
                
                return result
        
        # Si on est en mode fallback ou si le modèle n'est pas chargé, on utilise l'API externe
        if FALLBACK_MODE or not lazy_load_model():
            logger.info("Utilisation du mode API externe")
            result = await fallback_generate(input_data)
            
            # Mettre à jour le cache en arrière-plan
            background_tasks.add_task(
                update_cache,
                cache_id,
                input_data.prompt,
                input_data.system_prompt,
                DEFAULT_MODEL,
                result["generated_text"],
                input_data.temperature,
                input_data.top_p,
                input_data.max_length
            )
            
            return result
        
        # Mode local - on utilise le modèle chargé
        formatted_prompt = f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]"
        
        # Préparation des entrées pour le modèle
        inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)
        
        generation_config = {
            "max_length": inputs["input_ids"].shape[1] + input_data.max_length,
            "do_sample": True,
            "temperature": input_data.temperature,
            "top_p": input_data.top_p,
            "pad_token_id": tokenizer.eos_token_id
        }
        
        # Génération de texte
        outputs = model.generate(**inputs, **generation_config)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extraire uniquement la réponse (pas le prompt)
        result = result.split("[/INST]")[-1].strip()
        
        logger.info(f"Génération réussie, longueur: {len(result)}")
        
        # Mettre à jour le cache en arrière-plan
        background_tasks.add_task(
            update_cache,
            cache_id,
            input_data.prompt,
            input_data.system_prompt,
            DEFAULT_MODEL,
            result,
            input_data.temperature,
            input_data.top_p,
            input_data.max_length
        )
        
        return {"generated_text": result}
    except HTTPException as he:
        # Relancer les exceptions HTTP déjà formatées
        raise he
    except Exception as e:
        # Journal détaillé des erreurs pour faciliter le débogage
        logger.error(f"Erreur lors de la génération: {e}", exc_info=True)
        
        # Essayer le mode fallback en cas d'erreur
        logger.info("Tentative de génération via API externe suite à une erreur")
        try:
            return await fallback_generate(input_data)
        except Exception as fallback_e:
            logger.error(f"Échec également du fallback: {fallback_e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Erreur de génération et échec du fallback: {str(e)}"
            )

@app.get("/health")
async def health_check():
    mode = "fallback" if FALLBACK_MODE else "local"
    if not FALLBACK_MODE:
        lazy_load_model()
    
    # Inclure les statistiques du cache
    cache_stats = {"enabled": CACHE_ENABLED, "stats": None}
    
    if CACHE_ENABLED:
        try:
            conn = sqlite3.connect(CACHE_DB_PATH)
            cursor = conn.cursor()
            
            # Récupérer les statistiques du cache
            cursor.execute("SELECT key, value FROM cache_metadata WHERE key IN ('hits', 'misses', 'cache_expiry')")
            stats = {key: int(value) for key, value in cursor.fetchall()}
            
            # Récupérer le nombre d'entrées et la taille du cache
            cursor.execute("SELECT COUNT(*) FROM response_cache")
            stats["entries"] = cursor.fetchone()[0]
            
            conn.close()
            
            cache_stats["stats"] = stats
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des statistiques du cache: {e}")
            cache_stats["stats"] = {"error": str(e)}
    
    # Inclure les informations sur les ressources système
    system_resources = analyze_system_resources()
    
    return {
        "status": "ok", 
        "model": DEFAULT_MODEL,
        "version": "1.3.0",
        "timestamp": datetime.now().isoformat(),
        "type": mode,
        "fallback_mode": FALLBACK_MODE,
        "model_loaded": MODEL_LOADED,
        "cache": cache_stats,
        "system_resources": system_resources
    }

@app.get("/models")
async def list_models():
    return {
        "default": DEFAULT_MODEL,
        "available": [
            {
                "id": "mistralai/Mistral-7B-Instruct-v0.1",
                "name": "Mistral 7B",
                "description": "Modèle par défaut, équilibre performances et ressources"
            },
            {
                "id": "local/fallback",
                "name": "Mode léger (API)",
                "description": "Utilise une API externe pour l'inférence en cas de problème local"
            }
        ]
    }

@app.post("/analyze-system")
async def analyze_system(input_data: SystemResourcesRequest):
    """Endpoint pour analyser les ressources système sans générer de texte"""
    if input_data.analyzeSystem:
        resources = analyze_system_resources()
        
        # Ajouter des conseils basés sur les résultats
        if resources["can_run_local_model"]:
            resources["recommendation"] = "Votre système peut exécuter le modèle localement."
        else:
            resources["recommendation"] = "Votre système est limité. Utilisation du mode cloud recommandée."
        
        return resources
    
    return {"error": "Requête invalide"}

@app.get("/cache-stats")
async def get_cache_stats():
    """Endpoint pour obtenir les statistiques du cache"""
    if not CACHE_ENABLED:
        return {"enabled": False, "message": "Le cache est désactivé"}
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Récupérer les métadonnées du cache
        cursor.execute("SELECT key, value FROM cache_metadata")
        metadata = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Récupérer le nombre d'entrées
        cursor.execute("SELECT COUNT(*) FROM response_cache")
        entry_count = cursor.fetchone()[0]
        
        # Récupérer la taille moyenne des réponses
        cursor.execute("SELECT AVG(LENGTH(response)) FROM response_cache")
        avg_size = cursor.fetchone()[0]
        
        # Récupérer les 5 entrées les plus récentes (pour debugging)
        cursor.execute(
            "SELECT id, prompt, created_at FROM response_cache ORDER BY created_at DESC LIMIT 5"
        )
        recent_entries = [
            {
                "id": row[0],
                "prompt": row[1][:50] + "...",
                "created": datetime.fromtimestamp(row[2]).isoformat()
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return {
            "enabled": True,
            "location": CACHE_DB_PATH,
            "entries": entry_count,
            "hits": int(metadata.get("hits", 0)),
            "misses": int(metadata.get("misses", 0)),
            "avg_response_size": avg_size or 0,
            "expiry_seconds": int(metadata.get("cache_expiry", CACHE_EXPIRY)),
            "recent_entries": recent_entries
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques du cache: {e}")
        return {"enabled": True, "error": str(e)}

# Initialiser le cache au démarrage
init_cache()

if __name__ == "__main__":
    host = "0.0.0.0"  # Écoute sur toutes les interfaces
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Démarrage du serveur sur http://{host}:{port} (Mode {'léger' if FALLBACK_MODE else 'complet'})")
    
    # Vérification préliminaire des dépendances critiques
    try:
        import fastapi
        import uvicorn
        import pydantic
    except ImportError as e:
        logger.critical(f"Dépendances critiques manquantes: {e}")
        print(f"ERREUR FATALE: Dépendances critiques manquantes: {e}")
        print("Exécutez 'pip install fastapi uvicorn pydantic' pour installer les dépendances minimales.")
        sys.exit(1)
        
    # Vérification des dépendances optionnelles
    try:
        import aiohttp
    except ImportError:
        logger.warning("Package aiohttp manquant, installation...")
        os.system(f"{sys.executable} -m pip install aiohttp")
    
    # Vérification de psutil
    if not PSUTIL_AVAILABLE:
        try:
            logger.warning("Package psutil manquant, tentative d'installation...")
            os.system(f"{sys.executable} -m pip install psutil")
            import psutil
            PSUTIL_AVAILABLE = True
            logger.info("psutil installé avec succès")
        except:
            logger.warning("Échec de l'installation de psutil, l'analyse des ressources sera limitée")
    
    # Initialiser le cache
    init_cache()
    
    # Démarrage du serveur
    uvicorn.run(app, host=host, port=port, log_level="info")
