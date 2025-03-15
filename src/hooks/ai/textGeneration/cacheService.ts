
import { supabase } from '@/integrations/supabase/client';

// Interface for cached responses
export interface CachedResponse {
  prompt: string;
  system_prompt?: string;
  response: string;
  provider: string;
  user_id?: string;
  tokens_used: number;
  created_at?: string;
}

// Find a cached response based on prompt and provider
export const findCachedResponse = async (
  prompt: string, 
  systemPrompt: string, 
  provider: string,
  userId?: string
): Promise<CachedResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('response_cache')
      .select('*')
      .eq('prompt', prompt)
      .eq('provider', provider)
      .maybeSingle();

    if (error) {
      console.error('Error retrieving cached response:', error);
      return null;
    }

    return data as CachedResponse;
  } catch (err) {
    console.error('Exception retrieving cached response:', err);
    return null;
  }
};

// Cache a response
export const cacheResponse = async (
  prompt: string, 
  systemPrompt: string, 
  response: string, 
  provider: string, 
  tokensUsed: number,
  userId?: string
): Promise<void> => {
  try {
    const cacheItem: CachedResponse = {
      prompt,
      system_prompt: systemPrompt,
      response,
      provider,
      tokens_used: tokensUsed,
      user_id: userId
    };

    const { error } = await supabase
      .from('response_cache')
      .insert(cacheItem);

    if (error) {
      console.error('Error caching response:', error);
    }
  } catch (err) {
    console.error('Exception caching response:', err);
  }
};
