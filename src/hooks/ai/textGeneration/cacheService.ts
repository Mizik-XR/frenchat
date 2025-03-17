
import { supabase } from '@/integrations/supabase/client';

// Interface pour le service de cache
export interface AICacheService {
  cacheResponse: (key: string, response: string, validityHours?: number) => Promise<void>;
  getCachedResponse: (key: string) => Promise<string | null>;
  removeFromCache: (key: string) => Promise<void>;
  clearCache: () => Promise<void>;
  findCachedResponse?: (key: string) => Promise<string | null>; // Méthode de compatibilité
}

// Création du service de cache
export const createCacheService = (): AICacheService => {
  return {
    // Mettre en cache une réponse
    cacheResponse: async (key: string, response: string, validityHours = 24) => {
      try {
        // Calculer la date d'expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + validityHours);
        
        const { error } = await supabase
          .from('embeddings_cache')
          .upsert({
            key,
            value: response,
            expires_at: expiresAt.toISOString(),
            access_count: 1
          });
        
        if (error) throw error;
      } catch (err) {
        console.error('Erreur lors du cache de la réponse:', err);
      }
    },
    
    // Récupérer une réponse en cache
    getCachedResponse: async (key: string) => {
      try {
        const { data, error } = await supabase
          .from('embeddings_cache')
          .select('value, expires_at')
          .eq('key', key)
          .single();
        
        if (error || !data) return null;
        
        // Vérifier si la réponse n'est pas expirée
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          // La réponse est expirée, on la supprime du cache
          await supabase
            .from('embeddings_cache')
            .delete()
            .eq('key', key);
          
          return null;
        }
        
        // Incrémenter le compteur d'accès
        await supabase.rpc('increment_cache_access_count', { cache_key: key });
        
        return data.value;
      } catch (err) {
        console.error('Erreur lors de la récupération du cache:', err);
        return null;
      }
    },
    
    // Supprime une entrée du cache
    removeFromCache: async (key: string) => {
      try {
        const { error } = await supabase
          .from('embeddings_cache')
          .delete()
          .eq('key', key);
        
        if (error) throw error;
      } catch (err) {
        console.error('Erreur lors de la suppression du cache:', err);
      }
    },
    
    // Vide le cache
    clearCache: async () => {
      try {
        const { error } = await supabase
          .from('embeddings_cache')
          .delete()
          .gte('id', 0); // Supprime toutes les entrées
        
        if (error) throw error;
      } catch (err) {
        console.error('Erreur lors du vidage du cache:', err);
      }
    },
    
    // Méthode de compatibilité
    findCachedResponse: async (key: string) => {
      return await this.getCachedResponse(key);
    }
  };
};

// Export du singleton
export const cacheService = createCacheService();
export const AICacheService = cacheService; // Pour la compatibilité avec le code existant
