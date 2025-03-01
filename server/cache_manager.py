
"""
Gestionnaire de cache pour le serveur d'inférence IA
"""
import os
import sqlite3
import time
import hashlib
from .config import logger, CACHE_DIR, CACHE_DB_PATH, CACHE_ENABLED, CACHE_EXPIRY

def init_cache():
    """Initialise le cache SQLite"""
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

def generate_cache_id(prompt, system_prompt, model, temperature, top_p, max_length):
    """Génère un ID de cache basé sur la requête"""
    # Créer une chaîne avec tous les paramètres pertinents
    cache_string = f"{prompt}|{system_prompt}|{model}|{temperature}|{top_p}|{max_length}"
    # Générer un hash SHA-256
    return hashlib.sha256(cache_string.encode()).hexdigest()

def check_cache(cache_id):
    """Vérifie si une entrée existe dans le cache et n'a pas expiré"""
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

def update_cache(cache_id, prompt, system_prompt, model, response, temperature, top_p, max_length):
    """Met à jour le cache avec une nouvelle entrée"""
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

def get_cache_stats():
    """Récupère les statistiques du cache"""
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
                "prompt": row[1][:50] + "..." if len(row[1]) > 50 else row[1],
                "created": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(row[2]))
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
