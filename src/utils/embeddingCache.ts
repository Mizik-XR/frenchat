
/**
 * Système de cache optimisé pour les embeddings
 * Implémente un cache en mémoire et un cache persistant
 */

import { supabase } from "@/integrations/supabase/client";

// Type pour les entrées de cache d'embedding
interface EmbeddingCacheEntry {
  text: string;
  embedding: number[];
  model: string;
  timestamp: number;
}

// Type pour les options de cache
interface CacheOptions {
  useLocalCache: boolean;         // Utiliser le cache en mémoire
  usePersistentCache: boolean;    // Utiliser le cache en base de données
  cacheTTL: number;               // Durée de vie du cache en minutes
  compressionEnabled: boolean;    // Activer la compression pour économiser l'espace
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  useLocalCache: true,
  usePersistentCache: true,
  cacheTTL: 60 * 24 * 7, // 1 semaine par défaut
  compressionEnabled: true
};

// Cache en mémoire pour les requêtes fréquentes
const localCache = new Map<string, EmbeddingCacheEntry>();

/**
 * Génère une clé de cache basée sur le texte et le modèle
 */
function generateCacheKey(text: string, model: string): string {
  // Version simple: hash basé sur le texte et le modèle
  const normalizedText = text.trim().toLowerCase();
  return `${model}_${normalizedText}`;
}

/**
 * Compresse un vecteur d'embedding pour économiser de l'espace
 * Technique: quantification à 2 décimales et compression
 */
function compressEmbedding(embedding: number[]): number[] {
  // Simplification: arrondir à 2 décimales pour réduire la taille
  return embedding.map(value => parseFloat(value.toFixed(2)));
}

/**
 * Vérifie si une entrée de cache est encore valide
 */
function isCacheEntryValid(entry: EmbeddingCacheEntry, ttlMinutes: number): boolean {
  const now = Date.now();
  const ageInMinutes = (now - entry.timestamp) / (1000 * 60);
  return ageInMinutes <= ttlMinutes;
}

/**
 * Récupère un embedding depuis le cache
 */
export async function getCachedEmbedding(
  text: string,
  model: string,
  options: Partial<CacheOptions> = {}
): Promise<number[] | null> {
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(text, model);
  
  // 1. Vérifier le cache local (mémoire)
  if (opts.useLocalCache && localCache.has(cacheKey)) {
    const entry = localCache.get(cacheKey)!;
    if (isCacheEntryValid(entry, opts.cacheTTL)) {
      console.log('Cache hit (mémoire) pour:', cacheKey);
      return entry.embedding;
    } else {
      // Entrée expirée, supprimer
      localCache.delete(cacheKey);
    }
  }
  
  // 2. Vérifier le cache persistant (base de données)
  if (opts.usePersistentCache) {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('embeddings_cache')
        .select('value')
        .eq('key', cacheKey)
        .gt('expires_at', now.toISOString())
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Erreur lors de la recherche dans le cache:', error);
        }
        return null;
      }
      
      if (data) {
        console.log('Cache hit (BDD) pour:', cacheKey);
        
        // Incrémenter le compteur d'accès
        await supabase.rpc('increment_cache_access_count', { cache_key: cacheKey });
        
        // Ajouter au cache local pour les prochains accès
        if (opts.useLocalCache) {
          localCache.set(cacheKey, {
            text,
            embedding: data.value.embedding,
            model,
            timestamp: Date.now()
          });
        }
        
        return data.value.embedding;
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès au cache:', error);
    }
  }
  
  return null; // Pas trouvé dans le cache
}

/**
 * Stocke un embedding dans le cache
 */
export async function cacheEmbedding(
  text: string,
  embedding: number[],
  model: string,
  options: Partial<CacheOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(text, model);
  
  // Compression éventuelle de l'embedding
  const embeddingToStore = opts.compressionEnabled 
    ? compressEmbedding(embedding) 
    : embedding;
  
  // 1. Stocker dans le cache local
  if (opts.useLocalCache) {
    localCache.set(cacheKey, {
      text,
      embedding: embeddingToStore,
      model,
      timestamp: Date.now()
    });
  }
  
  // 2. Stocker dans le cache persistant
  if (opts.usePersistentCache) {
    try {
      // Calculer la date d'expiration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + opts.cacheTTL * 60 * 1000);
      
      const { error } = await supabase
        .from('embeddings_cache')
        .upsert({
          key: cacheKey,
          value: { 
            embedding: embeddingToStore,
            text: text,
            model: model
          },
          expires_at: expiresAt.toISOString(),
          compression_enabled: opts.compressionEnabled,
          access_count: 1
        }, {
          onConflict: 'key'
        });
      
      if (error) {
        console.error('Erreur lors du stockage dans le cache:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
    }
  }
}

/**
 * Nettoie les entrées expirées du cache local
 */
export function cleanupLocalCache(ttlMinutes: number = DEFAULT_CACHE_OPTIONS.cacheTTL): void {
  const now = Date.now();
  
  for (const [key, entry] of localCache.entries()) {
    const ageInMinutes = (now - entry.timestamp) / (1000 * 60);
    if (ageInMinutes > ttlMinutes) {
      localCache.delete(key);
    }
  }
}

/**
 * Nettoie les entrées expirées du cache persistant
 */
export async function cleanupPersistentCache(): Promise<void> {
  try {
    await supabase.rpc('cleanup_expired_cache');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache persistant:', error);
  }
}
