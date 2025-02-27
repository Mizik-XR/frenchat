import { supabase } from "@/integrations/supabase/client";
import { EmbeddingCacheItem, CacheConfig } from "@/types/config";
import { Json } from "@/types/database";

// Utility functions pour transformer les JSON en types appropriés
function isJsonWithEmbedding(json: Json): json is { embedding: number[] } {
  return typeof json === 'object' && json !== null && 'embedding' in json;
}

function isJsonWithText(json: Json): json is { text: string } {
  return typeof json === 'object' && json !== null && 'text' in json;
}

function isJsonWithModel(json: Json): json is { model: string } {
  return typeof json === 'object' && json !== null && 'model' in json;
}

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
 * Vérifie si un embedding est déjà en cache
 */
export async function checkEmbeddingCache(text: string, model: string): Promise<EmbeddingCacheItem | null> {
  const cacheKey = getCacheKey(text, model);
  
  // Vérifier d'abord le cache en mémoire
  const memCacheItem = memoryCache.get(cacheKey);
  if (memCacheItem && memCacheItem.expires > Date.now()) {
    console.log("Cache hit in memory");
    
    // Vérifier si les propriétés existent sur l'objet JSON
    const cacheData = memCacheItem.value;
    const embedding = isJsonWithEmbedding(cacheData) ? cacheData.embedding : undefined;
    const cachedText = isJsonWithText(cacheData) ? cacheData.text : undefined;
    const cachedModel = isJsonWithModel(cacheData) ? cacheData.model : undefined;
    
    if (embedding && cachedText && cachedModel) {
      return {
        embedding,
        text: cachedText,
        model: cachedModel
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
    
    // Récupérer les propriétés de l'objet JSON
    const cacheValue = data.value as Json;
    const embedding = isJsonWithEmbedding(cacheValue) ? cacheValue.embedding : undefined;
    const cachedText = isJsonWithText(cacheValue) ? cacheValue.text : undefined;
    const cachedModel = isJsonWithModel(cacheValue) ? cacheValue.model : undefined;
    
    if (embedding && cachedText && cachedModel) {
      // Mettre à jour le cache en mémoire
      memoryCache.set(cacheKey, {
        value: {
          embedding,
          text: cachedText,
          model: cachedModel
        },
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
        embedding,
        text: cachedText,
        model: cachedModel
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error checking embedding cache:", error);
    return null;
  }
}

/**
 * Ajoute un embedding au cache
 */
export async function addEmbeddingToCache(text: string, embedding: number[], model: string, metadata?: Record<string, any>): Promise<void> {
  if (!text || !embedding || !model) {
    console.warn("Missing required parameters for caching.");
    return;
  }

  const cacheKey = getCacheKey(text, model);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Expiration après 30 jours

  const cacheValue: CacheConfig = {
    embedding: embedding,
    text: text,
    model: model,
    metadata: metadata
  };

  try {
    const { error } = await supabase
      .from('embeddings_cache')
      .insert([
        {
          key: cacheKey,
          value: cacheValue as any,
          expires_at: expiresAt.toISOString(),
          compression_enabled: false
        }
      ]);

    if (error) {
      console.error("Error adding embedding to cache:", error);
    } else {
      console.log("Embedding added to cache");
      memoryCache.set(cacheKey, {
        value: cacheValue,
        expires: expiresAt.getTime()
      });
    }
  } catch (error) {
    console.error("Error adding embedding to cache:", error);
  }
}

/**
 * Supprime une entrée de cache
 */
export async function removeCacheEntry(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('embeddings_cache')
      .delete()
      .eq('key', key);

    if (error) {
      console.error("Error removing cache entry:", error);
    } else {
      console.log("Cache entry removed");
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error("Error removing cache entry:", error);
  }
}

/**
 * Efface le cache en mémoire
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
  console.log("Memory cache cleared");
}

/**
 * Efface le cache en base de données (Attention: Opération coûteuse)
 */
export async function clearDatabaseCache(): Promise<void> {
  try {
    const { error } = await supabase
      .from('embeddings_cache')
      .delete()
      .neq('key', ''); // Supprimer toutes les entrées

    if (error) {
      console.error("Error clearing database cache:", error);
    } else {
      console.log("Database cache cleared");
      clearMemoryCache(); // S'assurer de vider aussi le cache mémoire
    }
  } catch (error) {
    console.error("Error clearing database cache:", error);
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
    
    // Conversion sécurisée du JSON en CacheConfig
    const jsonValue = data.value as Json;
    const cacheConfig: CacheConfig = {};
    
    if (isJsonWithEmbedding(jsonValue)) {
      cacheConfig.embedding = jsonValue.embedding;
    }
    
    if (isJsonWithText(jsonValue)) {
      cacheConfig.text = jsonValue.text;
    }
    
    if (isJsonWithModel(jsonValue)) {
      cacheConfig.model = jsonValue.model;
    }
    
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
 * Met à jour la date d'expiration d'une entrée de cache
 */
export async function updateCacheExpiration(key: string, newExpiration: Date): Promise<void> {
  try {
    const { error } = await supabase
      .from('embeddings_cache')
      .update({ expires_at: newExpiration.toISOString() })
      .eq('key', key);

    if (error) {
      console.error("Error updating cache expiration:", error);
    } else {
      console.log("Cache expiration updated");
      // Mettre à jour aussi le cache mémoire si présent
      const memCacheItem = memoryCache.get(key);
      if (memCacheItem) {
        memoryCache.set(key, {
          value: memCacheItem.value,
          expires: newExpiration.getTime()
        });
      }
    }
  } catch (error) {
    console.error("Error updating cache expiration:", error);
  }
}

/**
 * Compresse une chaîne de caractères avec gzip
 */
async function compressString(text: string): Promise<string> {
  try {
    const compressed = await new Promise<string>((resolve, reject) => {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();
      writer.write(encoder.encode(text));
      writer.close();

      const reader = stream.readable.getReader();
      let result = '';
      const decoder = new TextDecoder();

      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          resolve(result);
          return;
        }
        result += decoder.decode(value);
        pump();
      };

      pump().catch(reject);
    });
    return compressed;
  } catch (error) {
    console.error("Error compressing string:", error);
    throw error;
  }
}

/**
 * Décompresse une chaîne de caractères compressée avec gzip
 */
async function decompressString(compressed: string): Promise<string> {
  try {
    const decompressed = await new Promise<string>((resolve, reject) => {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();
      writer.write(encoder.encode(compressed));
      writer.close();

      const reader = stream.readable.getReader();
      let result = '';
      const decoder = new TextDecoder();

      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          resolve(result);
          return;
        }
        result += decoder.decode(value);
        pump();
      };

      pump().catch(reject);
    });
    return decompressed;
  } catch (error) {
    console.error("Error decompressing string:", error);
    throw error;
  }
}
