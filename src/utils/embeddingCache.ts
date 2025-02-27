
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

// Nouvelle interface pour le système optimisé
interface Vector {
  id: string;
  dimensions: number;
  values: number[];
}

// Interface améliorée pour les entrées de cache
interface CacheEntry {
  vector: Vector;
  text: string;
  modelId: string;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
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

/**
 * Système de cache optimisé avec LRU et préchargement
 * Implémentation améliorée proposée par Claude
 */
export class OptimizedEmbeddingCache {
  private static instance: OptimizedEmbeddingCache;
  private cache: Map<string, CacheEntry> = new Map();
  private heatMap: Map<string, number> = new Map();
  private readonly ttl: number = 24 * 60 * 60 * 1000; // 24 heures par défaut
  private readonly maxSize: number = 1000; // Taille maximale du cache
  
  private constructor() {
    // Nettoyer périodiquement le cache
    setInterval(() => this.cleanupCache(), 60 * 60 * 1000); // Toutes les heures
  }
  
  /**
   * Obtient l'instance singleton du cache
   */
  public static getInstance(): OptimizedEmbeddingCache {
    if (!OptimizedEmbeddingCache.instance) {
      OptimizedEmbeddingCache.instance = new OptimizedEmbeddingCache();
    }
    return OptimizedEmbeddingCache.instance;
  }
  
  /**
   * Récupère un vecteur depuis le cache optimisé
   */
  async get(key: string): Promise<Vector | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Cache miss - vérifier la base de données
      const dbEntry = await this.fetchFromDatabase(key);
      if (dbEntry) {
        this.set(key, dbEntry);
        return dbEntry.vector;
      }
      return null;
    }
    
    // Mettre à jour la heat map (carte de chaleur d'utilisation)
    this.updateHeatMap(key);
    
    if (Date.now() > entry.expiresAt) {
      // Expiré mais toujours utilisé fréquemment - rafraîchir de façon asynchrone
      if ((this.heatMap.get(key) || 0) > 5) {
        this.refreshAsynchronously(key);
        return entry.vector; // Retourner l'entrée expirée en attendant le rafraîchissement
      } else {
        // Peu utilisé et expiré - supprimer
        this.cache.delete(key);
        return null;
      }
    }
    
    return entry.vector;
  }
  
  /**
   * Stocke un vecteur dans le cache
   */
  set(key: string, entry: CacheEntry): void {
    // Vérifier si le cache est plein
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, entry);
    this.updateHeatMap(key);
  }
  
  /**
   * Met à jour la carte de chaleur d'utilisation
   */
  private updateHeatMap(key: string): void {
    const currentHeat = this.heatMap.get(key) || 0;
    this.heatMap.set(key, currentHeat + 1);
  }
  
  /**
   * Supprime l'entrée la moins utilisée du cache
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let lowestHeat = Infinity;
    
    for (const [key, heat] of this.heatMap.entries()) {
      if (heat < lowestHeat) {
        lowestHeat = heat;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.heatMap.delete(leastUsedKey);
    }
  }
  
  /**
   * Rafraîchit une entrée de cache de façon asynchrone
   */
  private async refreshAsynchronously(key: string): Promise<void> {
    try {
      const freshEntry = await this.fetchFromDatabase(key);
      if (freshEntry) {
        this.set(key, freshEntry);
      }
    } catch (error) {
      console.error(`Erreur lors du rafraîchissement asynchrone de ${key}:`, error);
    }
  }
  
  /**
   * Récupère une entrée depuis la base de données
   */
  private async fetchFromDatabase(key: string): Promise<CacheEntry | null> {
    try {
      const { data, error } = await supabase
        .from('embeddings_cache')
        .select('value, key, access_count, expires_at')
        .eq('key', key)
        .single();
      
      if (error || !data) return null;
      
      // Mettre à jour le compteur d'accès
      await supabase.rpc('increment_cache_access_count', { cache_key: key });
      
      return {
        vector: {
          id: key,
          dimensions: data.value.embedding.length,
          values: data.value.embedding
        },
        text: data.value.text,
        modelId: data.value.model,
        timestamp: Date.now(),
        expiresAt: new Date(data.expires_at).getTime(),
        accessCount: data.access_count + 1
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis la base de données pour ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Précharge des vecteurs liés en fonction des modèles d'utilisation
   */
  async preloadRelatedVectors(key: string): Promise<void> {
    try {
      const relatedKeys = await this.predictRelatedKeys(key);
      
      // Précharger de façon asynchrone sans bloquer
      Promise.all(relatedKeys.map(k => this.fetchFromDatabase(k)
        .then(entry => entry && this.set(k, entry))));
      
    } catch (error) {
      console.error(`Erreur lors du préchargement pour ${key}:`, error);
    }
  }
  
  /**
   * Prédit les clés qui pourraient être demandées prochainement
   * Basé sur les modèles d'utilisation historiques
   */
  private async predictRelatedKeys(key: string): Promise<string[]> {
    try {
      // Cette implémentation pourrait être améliorée avec un algorithme plus sophistiqué
      // Pour l'instant, on récupère simplement les clés les plus utilisées du même modèle
      const modelPrefix = key.split('_')[0];
      
      const { data, error } = await supabase
        .from('embeddings_cache')
        .select('key')
        .like('key', `${modelPrefix}_%`)
        .order('access_count', { ascending: false })
        .limit(5);
      
      if (error || !data) return [];
      
      return data.map(item => item.key).filter(k => k !== key);
    } catch (error) {
      console.error(`Erreur lors de la prédiction des clés liées pour ${key}:`, error);
      return [];
    }
  }
  
  /**
   * Nettoie le cache en supprimant les entrées expirées
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt && (this.heatMap.get(key) || 0) <= 5) {
        this.cache.delete(key);
        this.heatMap.delete(key);
      }
    }
  }
}

// Exporter une instance singleton pour faciliter l'utilisation
export const optimizedCache = OptimizedEmbeddingCache.getInstance();
