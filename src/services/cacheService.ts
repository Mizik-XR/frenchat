
// Import des fonctions de conversion de types
import { jsonToType } from '@/integrations/supabase/typesCompatibility';
import { supabase } from '@/integrations/supabase/client';

export interface CachedResponse {
  id: string;
  key: string;
  prompt: string;
  response: string;
  provider: string;
  tokens_used: number;
  estimated_cost: number;
  user_id: string;
  metadata: any;
  hash: string;
  expiration_date: Date;
  access_count: number;
}

export class AICacheService {
  private CACHE_EXPIRATION_TIME = 7 * 24 * 60 * 60; // 7 days in seconds

  async getCachedResponse(
    prompt: string,
    provider: string,
    userId: string,
    metadata: any = {}
  ): Promise<CachedResponse | null> {
    const hash = this.generateCacheKey(prompt, provider, metadata);

    try {
      const { data: item, error } = await supabase
        .from('embeddings_cache')
        .select('*')
        .eq('key', hash)
        .single();

      if (error) {
        console.error('Error fetching cache:', error);
        return null;
      }

      if (!item) {
        return null;
      }

      // Vérifier le format de la réponse
      if (item.value) {
        const cacheValue = typeof item.value === 'string' 
          ? JSON.parse(item.value) 
          : item.value;

        return {
          id: item.id,
          key: item.key,
          prompt: cacheValue.prompt || '',
          response: cacheValue.response || '',
          provider: cacheValue.provider || provider,
          tokens_used: cacheValue.tokens_used || 0,
          estimated_cost: cacheValue.estimated_cost || 0,
          user_id: cacheValue.user_id || userId,
          metadata: cacheValue.metadata || metadata,
          hash: item.key,
          expiration_date: new Date(item.expires_at),
          access_count: item.access_count || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getCachedResponse:', error);
      return null;
    }
  }

  async cacheResponse(
    prompt: string,
    response: string,
    provider: string,
    userId: string,
    metadata: any = {}
  ): Promise<void> {
    const hash = this.generateCacheKey(prompt, provider, metadata);
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + this.CACHE_EXPIRATION_TIME);

    const cacheValue = {
      prompt,
      response,
      provider,
      tokens_used: 0,
      estimated_cost: 0,
      user_id: userId,
      metadata
    };

    try {
      await supabase.from('embeddings_cache').insert({
        key: hash,
        value: cacheValue,
        expires_at: expirationDate.toISOString(),
      });
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  private generateCacheKey(prompt: string, provider: string, metadata: any): string {
    const metadataString = JSON.stringify(metadata || {});
    return `${prompt}-${provider}-${metadataString}`;
  }
}

// Export des fonctions directes pour compatibilité
export const getCachedResponse = async (
  prompt: string,
  provider: string,
  userId: string,
  metadata: any = {}
): Promise<CachedResponse | null> => {
  const cacheService = new AICacheService();
  return cacheService.getCachedResponse(prompt, provider, userId, metadata);
};

export const setCachedResponse = async (
  prompt: string,
  response: string,
  provider: string,
  tokensUsed: number,
  estimatedCost: number,
  userId: string,
  metadata: any = {}
): Promise<void> => {
  const cacheService = new AICacheService();
  return cacheService.cacheResponse(prompt, response, provider, userId, metadata);
};
