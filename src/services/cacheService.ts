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

const CACHE_EXPIRATION_TIME = 7 * 24 * 60 * 60; // 7 days in seconds

export const getCachedResponse = async (
  prompt: string,
  provider: string,
  userId: string,
  metadata: any
): Promise<CachedResponse | null> => {
  const hash = generateCacheKey(prompt, provider, metadata);

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

    // Remplacez par une conversion explicite:
    return {
      id: item.id,
      key: item.key,
      prompt: item.prompt,
      response: item.response,
      provider: item.provider,
      tokens_used: item.tokens_used,
      estimated_cost: item.estimated_cost,
      user_id: item.user_id,
      metadata: item.metadata,
      hash: item.key, // Utiliser la clé comme hash
      expiration_date: new Date(item.expires_at),
      access_count: item.access_count
    } as CachedResponse;
  } catch (error) {
    console.error('Error in getCachedResponse:', error);
    return null;
  }
};

export const setCachedResponse = async (
  prompt: string,
  response: string,
  provider: string,
  tokensUsed: number,
  estimatedCost: number,
  userId: string,
  metadata: any
): Promise<void> => {
  const hash = generateCacheKey(prompt, provider, metadata);
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + CACHE_EXPIRATION_TIME);

  try {
    // Corriger l'objet d'insertion pour n'inclure que les champs valides:
    await supabase.from('embeddings_cache').insert({
      key: hash,
      prompt: prompt,
      response: response,
      provider: provider,
      tokens_used: tokensUsed,
      estimated_cost: estimatedCost,
      metadata: metadata as any, // Conversion explicite
      expires_at: expirationDate.toISOString(),
      user_id: userId
    });
  } catch (error) {
    console.error('Error caching response:', error);
  }
};

function generateCacheKey(prompt: string, provider: string, metadata: any): string {
  const metadataString = JSON.stringify(metadata || {});
  return `${prompt}-${provider}-${metadataString}`;
}
