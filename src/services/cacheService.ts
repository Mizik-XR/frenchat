
import { supabase } from "@/integrations/supabase/client";

// Type pour les réponses mises en cache
export type CachedResponse = {
  key: string;
  prompt: string;
  response: string;
  provider: string;
  tokens_used: number;
  estimated_cost: number;
  expires_at: Date;
  access_count: number;
  metadata?: Record<string, any>;
};

// Clé pour le stockage local du cache en mode hors ligne
const LOCAL_CACHE_KEY = 'filechat_response_cache';

// Durée par défaut de validité du cache (24 heures)
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Gère le cache des réponses de l'IA
 */
export class CacheService {
  // Récupère une réponse mise en cache
  static async get(key: string): Promise<CachedResponse | null> {
    try {
      // Essayer d'abord dans Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('response_cache')
          .select('*')
          .eq('key', key)
          .single();
        
        if (error) {
          console.warn('Erreur lors de la récupération du cache Supabase:', error);
        }
        
        if (data) {
          // Incrémenter le compteur d'accès
          await supabase
            .from('response_cache')
            .update({ access_count: (data.access_count || 0) + 1 })
            .eq('id', data.id);
          
          return data as unknown as CachedResponse;
        }
      }
      
      // Essayer ensuite dans le stockage local
      const localCache = this.getLocalCache();
      const cachedItem = localCache.find(item => item.key === key);
      
      if (cachedItem) {
        // Vérifier si le cache n'est pas expiré
        if (new Date(cachedItem.expires_at) > new Date()) {
          cachedItem.access_count += 1;
          this.setLocalCache(localCache);
          return cachedItem;
        } else {
          // Supprimer le cache expiré
          this.removeLocalCacheItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }
  
  // Stocke une réponse dans le cache
  static async set(item: Omit<CachedResponse, 'access_count' | 'expires_at'> & { 
    ttl?: number, 
    expires_at?: Date 
  }): Promise<boolean> {
    try {
      const expiresAt = item.expires_at || new Date(Date.now() + (item.ttl || DEFAULT_CACHE_DURATION));
      const cacheItem: CachedResponse = {
        ...item,
        access_count: 0,
        expires_at: expiresAt
      };
      
      // Essayer d'abord dans Supabase
      if (supabase) {
        const { error } = await supabase
          .from('response_cache')
          .upsert({
            key: cacheItem.key,
            prompt: cacheItem.prompt,
            response: cacheItem.response,
            provider: cacheItem.provider,
            tokens_used: cacheItem.tokens_used,
            estimated_cost: cacheItem.estimated_cost,
            expires_at: expiresAt.toISOString(),
            metadata: cacheItem.metadata || {},
            access_count: 0
          });
        
        if (error) {
          console.warn('Erreur lors du stockage dans le cache Supabase:', error);
        } else {
          return true;
        }
      }
      
      // En cas d'échec ou en mode hors ligne, utiliser le stockage local
      const localCache = this.getLocalCache();
      const existingIndex = localCache.findIndex(i => i.key === cacheItem.key);
      
      if (existingIndex >= 0) {
        localCache[existingIndex] = cacheItem;
      } else {
        localCache.push(cacheItem);
      }
      
      this.setLocalCache(localCache);
      return true;
    } catch (error) {
      console.error('Erreur lors du stockage dans le cache:', error);
      return false;
    }
  }
  
  // Supprime une entrée du cache
  static async remove(key: string): Promise<boolean> {
    try {
      let success = true;
      
      // Essayer d'abord dans Supabase
      if (supabase) {
        const { error } = await supabase
          .from('response_cache')
          .delete()
          .eq('key', key);
        
        if (error) {
          console.warn('Erreur lors de la suppression du cache Supabase:', error);
          success = false;
        }
      }
      
      // Supprimer également du stockage local
      this.removeLocalCacheItem(key);
      
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
      return false;
    }
  }
  
  // Récupère le cache local depuis le stockage local
  private static getLocalCache(): CachedResponse[] {
    try {
      const cache = localStorage.getItem(LOCAL_CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération du cache local:', error);
      return [];
    }
  }
  
  // Stocke le cache local
  private static setLocalCache(cache: CachedResponse[]): void {
    try {
      // Limiter la taille du cache local à 100 éléments
      const trimmedCache = cache.slice(0, 100);
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(trimmedCache));
    } catch (error) {
      console.error('Erreur lors du stockage du cache local:', error);
    }
  }
  
  // Supprime un élément du cache local
  private static removeLocalCacheItem(key: string): void {
    try {
      const localCache = this.getLocalCache();
      const filteredCache = localCache.filter(item => item.key !== key);
      this.setLocalCache(filteredCache);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache local:', error);
    }
  }
  
  // Nettoie les entrées expirées du cache
  static async cleanup(): Promise<number> {
    try {
      let countRemoved = 0;
      
      // Nettoyer le cache Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('response_cache')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .select();
        
        if (error) {
          console.warn('Erreur lors du nettoyage du cache Supabase:', error);
        } else {
          countRemoved += data?.length || 0;
        }
      }
      
      // Nettoyer le cache local
      const localCache = this.getLocalCache();
      const now = new Date();
      const validCache = localCache.filter(item => new Date(item.expires_at) > now);
      
      countRemoved += localCache.length - validCache.length;
      this.setLocalCache(validCache);
      
      return countRemoved;
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
      return 0;
    }
  }
}
