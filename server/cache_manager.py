"""
Gestionnaire de cache pour le serveur d'inférence IA
"""
import os
import sqlite3
import time
import hashlib
import json
import zlib
import base64
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
        max_length INTEGER,
        compressed BOOLEAN DEFAULT 0,
        user_id TEXT DEFAULT NULL
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
    cursor.execute("INSERT OR IGNORE INTO cache_metadata VALUES (?, ?)",
                 ("compression_enabled", "1"))  # Activer la compression par défaut
    
    conn.commit()
    conn.close()
    
    logger.info(f"Cache initialisé: {CACHE_DB_PATH}")
    
    # Nettoyer les entrées expirées au démarrage
    clean_expired_entries()

def generate_cache_id(prompt, system_prompt, model, temperature, top_p, max_length, user_id=None):
    """Génère un ID de cache basé sur la requête"""
    # Créer une chaîne avec tous les paramètres pertinents
    cache_string = f"{prompt}|{system_prompt}|{model}|{temperature}|{top_p}|{max_length}"
    
    # Ajouter l'ID utilisateur si disponible pour la personnalisation
    if user_id:
        cache_string += f"|{user_id}"
    
    # Générer un hash SHA-256
    return hashlib.sha256(cache_string.encode()).hexdigest()

def compress_text(text):
    """Compresse le texte en utilisant zlib"""
    try:
        compressed = zlib.compress(text.encode('utf-8'))
        return base64.b64encode(compressed).decode('ascii')
    except Exception as e:
        logger.error(f"Erreur lors de la compression: {e}")
        return text

def decompress_text(compressed_text):
    """Décompresse le texte compressé par zlib"""
    try:
        decoded = base64.b64decode(compressed_text.encode('ascii'))
        return zlib.decompress(decoded).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de la décompression: {e}")
        return compressed_text

def is_compression_enabled():
    """Vérifie si la compression est activée dans les métadonnées"""
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM cache_metadata WHERE key = ?", ("compression_enabled",))
        result = cursor.fetchone()
        conn.close()
        
        if result and result[0] == "1":
            return True
        return False
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de la compression: {e}")
        return False

def check_cache(cache_id, user_id=None):
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
        
        # Préparer la requête de base
        query = """
            SELECT response, compressed 
            FROM response_cache 
            WHERE id = ? AND created_at > ?
        """
        params = [cache_id, expiry_time]
        
        # Si un user_id est fourni, vérifier pour cet utilisateur ou les entrées publiques
        if user_id:
            query += " AND (user_id = ? OR user_id IS NULL)"
            params.append(user_id)
        
        # Exécuter la requête
        cursor.execute(query, params)
        result = cursor.fetchone()
        
        if result:
            # Incrémenter le compteur de hits
            cursor.execute("UPDATE cache_metadata SET value = CAST(value AS INTEGER) + 1 WHERE key = 'hits'")
            conn.commit()
            
            response = result[0]
            is_compressed = result[1] == 1
            
            conn.close()
            
            # Décompresser si nécessaire
            if is_compressed:
                response = decompress_text(response)
                
            return response
        
        # Incrémenter le compteur de misses
        cursor.execute("UPDATE cache_metadata SET value = CAST(value AS INTEGER) + 1 WHERE key = 'misses'")
        conn.commit()
        conn.close()
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du cache: {e}")
        return None

def update_cache(cache_id, prompt, system_prompt, model, response, temperature, top_p, max_length, user_id=None):
    """Met à jour le cache avec une nouvelle entrée"""
    if not CACHE_ENABLED:
        return
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Vérifier si la compression est activée
        compression_enabled = is_compression_enabled()
        
        # Compresser la réponse si la compression est activée
        stored_response = response
        if compression_enabled:
            stored_response = compress_text(response)
        
        # Insérer ou remplacer l'entrée dans le cache
        cursor.execute(
            "INSERT OR REPLACE INTO response_cache VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (cache_id, prompt, system_prompt, model, stored_response, int(time.time()), 
             temperature, top_p, max_length, compression_enabled, user_id)
        )
        
        conn.commit()
        conn.close()
        
        # Logger le ratio de compression si activé
        if compression_enabled:
            original_size = len(response)
            compressed_size = len(stored_response)
            ratio = (1 - (compressed_size / original_size)) * 100 if original_size > 0 else 0
            logger.debug(f"Cache: Ratio de compression: {ratio:.2f}% ({original_size} -> {compressed_size} octets)")
            
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du cache: {e}")

def clean_expired_entries():
    """Nettoie les entrées expirées du cache"""
    if not CACHE_ENABLED:
        return
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Récupérer la durée d'expiration des métadonnées
        cursor.execute("SELECT value FROM cache_metadata WHERE key = ?", ("cache_expiry",))
        cache_expiry = int(cursor.fetchone()[0])
        
        # Calculer le timestamp d'expiration
        expiry_time = int(time.time()) - cache_expiry
        
        # Supprimer les entrées expirées
        cursor.execute("DELETE FROM response_cache WHERE created_at <= ?", (expiry_time,))
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if deleted_count > 0:
            logger.info(f"Cache: {deleted_count} entrées expirées supprimées")
            
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage du cache: {e}")

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
        
        # Récupérer l'utilisation d'espace total
        cursor.execute("SELECT SUM(LENGTH(response)) FROM response_cache")
        total_size = cursor.fetchone()[0] or 0
        
        # Récupérer des stats sur la compression
        cursor.execute("SELECT COUNT(*), AVG(LENGTH(response)) FROM response_cache WHERE compressed = 1")
        compressed_result = cursor.fetchone()
        compressed_count = compressed_result[0] if compressed_result else 0
        avg_compressed_size = compressed_result[1] if compressed_result else 0
        
        # Récupérer le nombre d'entrées expirées (mais pas encore supprimées)
        cursor.execute("SELECT value FROM cache_metadata WHERE key = ?", ("cache_expiry",))
        cache_expiry = int(cursor.fetchone()[0])
        expiry_time = int(time.time()) - cache_expiry
        cursor.execute("SELECT COUNT(*) FROM response_cache WHERE created_at <= ?", (expiry_time,))
        expired_count = cursor.fetchone()[0]
        
        # Récupérer les 5 entrées les plus récentes (pour debugging)
        cursor.execute(
            "SELECT id, prompt, created_at, compressed FROM response_cache ORDER BY created_at DESC LIMIT 5"
        )
        recent_entries = [
            {
                "id": row[0],
                "prompt": row[1][:50] + "..." if row[1] and len(row[1]) > 50 else row[1],
                "created": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(row[2])),
                "compressed": row[3] == 1
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        # Calculer le taux de succès du cache (hits / (hits + misses))
        hits = int(metadata.get("hits", 0))
        misses = int(metadata.get("misses", 0))
        hit_rate = (hits / (hits + misses)) * 100 if (hits + misses) > 0 else 0
        
        return {
            "enabled": True,
            "location": CACHE_DB_PATH,
            "entries": entry_count,
            "hits": hits,
            "misses": misses,
            "hit_rate": f"{hit_rate:.2f}%",
            "avg_response_size": avg_size or 0,
            "total_size_kb": f"{total_size / 1024:.2f}",
            "expiry_seconds": int(metadata.get("cache_expiry", CACHE_EXPIRY)),
            "compression_enabled": metadata.get("compression_enabled") == "1",
            "compressed_entries": compressed_count,
            "avg_compressed_size": avg_compressed_size or 0, 
            "expired_entries": expired_count,
            "recent_entries": recent_entries
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques du cache: {e}")
        return {"enabled": True, "error": str(e)}

def toggle_compression(enabled=True):
    """Active ou désactive la compression dans le cache"""
    if not CACHE_ENABLED:
        return False
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Mettre à jour le paramètre de compression
        cursor.execute(
            "UPDATE cache_metadata SET value = ? WHERE key = 'compression_enabled'", 
            ("1" if enabled else "0",)
        )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cache: Compression {'activée' if enabled else 'désactivée'}")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la modification de la compression: {e}")
        return False

def set_cache_ttl(ttl_seconds):
    """Définit la durée de vie (TTL) des entrées du cache"""
    if not CACHE_ENABLED or ttl_seconds <= 0:
        return False
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Mettre à jour le TTL
        cursor.execute(
            "UPDATE cache_metadata SET value = ? WHERE key = 'cache_expiry'", 
            (str(ttl_seconds),)
        )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cache: TTL défini à {ttl_seconds} secondes")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la modification du TTL: {e}")
        return False

def purge_cache():
    """Vide complètement le cache"""
    if not CACHE_ENABLED:
        return False
    
    try:
        conn = sqlite3.connect(CACHE_DB_PATH)
        cursor = conn.cursor()
        
        # Supprimer toutes les entrées
        cursor.execute("DELETE FROM response_cache")
        deleted_count = cursor.rowcount
        
        # Réinitialiser les compteurs
        cursor.execute("UPDATE cache_metadata SET value = '0' WHERE key = 'hits'")
        cursor.execute("UPDATE cache_metadata SET value = '0' WHERE key = 'misses'")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cache: {deleted_count} entrées supprimées (cache vidé)")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la purge du cache: {e}")
        return False
