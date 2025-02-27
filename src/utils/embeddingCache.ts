
import { supabase } from "@/integrations/supabase/client";
import { EmbeddingCacheItem, CacheConfig } from "@/types/config";

// Cache en mémoire pour réduire les appels à la base de données
const memoryCache = new Map<string, {
  value: CacheConfig,
  expires: number
}>();

/**
 * Calcule une clé de cache basée sur le texte et le modèle
 */
function getCacheKey(text: string, model: string): string {
  // Utiliser un hachage simple pour le texte
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Conversion en 32bit integer
  }
  return `${model}_${hash}`;
}

/**
 * Vérification sécurisée du type du cache pour éviter les erreurs d'accès
 */
function ensureCacheObject(value: any): CacheConfig {
  // Si c'est déjà un objet avec des propriétés, on le retourne
  if (typeof value === 'object' && value !== null) {
    return value as CacheConfig;
  }
  
  // Si c'est une chaîne JSON, on essaie de la parser
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as CacheConfig;
    } catch (e) {
      console.error('Erreur lors du parsing JSON:', e);
      return {};
    }
  }
  
  // Par défaut, retourner un objet vide
  return {};
}

/**
 * Vérifie si un embedding est déjà en cache
 */
export async function checkEmbeddingCache(text: string, model: string): Promise<EmbeddingCacheItem | null> {
  const cacheKey = getCacheKey(text, model);
  
  // Vérifier d'abord le cache en mémoire
  const memCacheItem = memoryCache.get(cacheKey);
  if (memCacheItem && memCacheItem.expires > Date.now()) {
    console.log("Cache hit in memory");
    
    const cacheData = memCacheItem.value;
    if (cacheData.embedding && cacheData.text && cacheData.model) {
      return {
        embedding: cacheData.embedding,
        text: cacheData.text,
        model: cacheData.model,
        metadata: cacheData.metadata
      };
    }
  }
  
  // Sinon, vérifier dans la base de données
  try {
    const { data, error } = await supabase
      .from('embeddings_cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Vérifier si l'entrée de cache est expirée
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      console.log("Cache entry expired");
      return null;
    }
    
    // Récupérer les propriétés de l'objet JSON de manière sécurisée
    const cacheValue = ensureCacheObject(data.value);
    
    if (cacheValue.embedding && cacheValue.text && cacheValue.model) {
      // Mettre à jour le cache en mémoire
      memoryCache.set(cacheKey, {
        value: cacheValue,
        expires: expiresAt.getTime()
      });
      
      console.log("Cache hit in database");
      
      // Incrémenter le compteur d'accès en arrière-plan
      supabase.rpc('increment_cache_access_count', {
        cache_key: cacheKey
      }).then(() => {
        console.log("Access count incremented");
      });
      
      return {
        embedding: cacheValue.embedding,
        text: cacheValue.text,
        model: cacheValue.model,
        metadata: cacheValue.metadata
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error checking embedding cache:", error);
    return null;
  }
}

/**
 * Stocke un embedding dans le cache
 */
export async function storeEmbeddingInCache(item: EmbeddingCacheItem, ttlHours: number = 24): Promise<boolean> {
  const cacheKey = getCacheKey(item.text, item.model);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);
  
  try {
    // Stocker dans le cache en mémoire d'abord
    memoryCache.set(cacheKey, {
      value: {
        embedding: item.embedding,
        text: item.text,
        model: item.model,
        metadata: item.metadata || {}
      },
      expires: expiresAt.getTime()
    });
    
    // Stocker dans la base de données ensuite
    const { error } = await supabase
      .from('embeddings_cache')
      .upsert({
        key: cacheKey,
        value: {
          embedding: item.embedding,
          text: item.text,
          model: item.model,
          metadata: item.metadata || {}
        },
        expires_at: expiresAt.toISOString(),
        access_count: 1
      });
    
    if (error) throw error;
    
    console.log("Stored embedding in cache");
    return true;
  } catch (error) {
    console.error("Error storing embedding in cache:", error);
    return false;
  }
}

/**
 * Récupère une entrée de cache par sa clé
 */
export async function getCacheEntry(key: string): Promise<{ data: CacheConfig, expires: Date } | null> {
  try {
    const { data, error } = await supabase
      .from('embeddings_cache')
      .select('value, expires_at')
      .eq('key', key)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }
    
    // Conversion sécurisée
    const cacheConfig = ensureCacheObject(data.value);
    
    return {
      data: cacheConfig,
      expires: expiresAt
    };
  } catch (error) {
    console.error("Error getting cache entry:", error);
    return null;
  }
}

/**
 * Invalide une entrée de cache par sa clé
 */
export async function invalidateCacheEntry(key: string): Promise<boolean> {
  try {
    // Supprimer du cache en mémoire
    memoryCache.delete(key);
    
    // Supprimer de la base de données
    const { error } = await supabase
      .from('embeddings_cache')
      .delete()
      .eq('key', key);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error invalidating cache entry:", error);
    return false;
  }
}

// Exportation des fonctions pour les tests
export const getCachedEmbedding = checkEmbeddingCache;
export const cacheEmbedding = storeEmbeddingInCache;
export const optimizedCache = {
  get: checkEmbeddingCache,
  set: storeEmbeddingInCache,
  invalidate: invalidateCacheEntry
};
