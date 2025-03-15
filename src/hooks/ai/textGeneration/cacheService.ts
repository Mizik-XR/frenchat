
import { APP_STATE } from '@/integrations/supabase/client';
import { cacheService, CachedResponse } from '@/services/cacheService';

/**
 * Cache manager for text generation to avoid duplicate API calls
 */
export class AIResponseCache {
  private userId: string | null = null;
  
  constructor() {
    console.log("Initializing AI response cache");
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Check if a response is available in the cache
   */
  async getResponse(prompt: string, provider: string): Promise<string | null> {
    if (APP_STATE.isOfflineMode) {
      console.log("Offline mode active, using cache if available");
    }
    
    try {
      const cachedResponse = await cacheService.getResponse(prompt, provider);
      return cachedResponse ? cachedResponse.response : null;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }

  /**
   * Save a response to the cache
   */
  async saveResponse(prompt: string, response: string, provider: string, tokensUsed: number): Promise<void> {
    try {
      const cacheItem: CachedResponse = {
        prompt,
        response,
        provider,
        tokens_used: tokensUsed,
        user_id: this.userId || undefined
      };
      
      await cacheService.saveResponse(cacheItem);
    } catch (error) {
      console.error("Cache save error:", error);
    }
  }

  /**
   * Clear cached responses older than a specified number of days
   */
  async clearOldCaches(days: number = 7): Promise<void> {
    try {
      await cacheService.clearOldCaches(days);
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
}

// Export a singleton instance
export const aiResponseCache = new AIResponseCache();
