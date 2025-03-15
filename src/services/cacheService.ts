
import { supabase } from '@/integrations/supabase/client';

// Interface for the cached response
export interface CachedResponse {
  id?: string;
  prompt: string;
  response: string;
  provider: string;
  tokens_used: number;
  user_id?: string;
  created_at?: string;
  expires_at?: string;
}

// Cache service implementation
export class CacheService {
  private LOCAL_STORAGE_KEY = 'filechat_response_cache';
  
  // Get a cached response for a prompt
  async getResponse(prompt: string, provider: string): Promise<CachedResponse | null> {
    try {
      // Try local storage first for offline mode
      const localCache = this.getLocalCache();
      const localMatch = localCache.find(item => 
        item.prompt === prompt && item.provider === provider);
      
      if (localMatch) {
        console.log("Found response in local cache");
        return localMatch;
      }
      
      // If online, try database
      if (supabase) {
        console.log("Checking database cache for:", { prompt: prompt.substring(0, 30) + "...", provider });
        
        // Use try/catch to handle potential database errors
        try {
          const { data, error } = await supabase
            .from('response_cache')
            .select('*')
            .eq('prompt_hash', this.hashString(prompt))
            .eq('provider', provider)
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error("Database cache query error:", error);
            return null;
          }
          
          if (data) {
            console.log("Found response in database cache");
            // Save to local cache for future use
            this.saveToLocalCache({
              prompt,
              response: data.response,
              provider,
              tokens_used: data.tokens_used
            });
            
            return {
              id: data.id,
              prompt,
              response: data.response,
              provider,
              tokens_used: data.tokens_used,
              user_id: data.user_id,
              created_at: data.created_at,
              expires_at: data.expires_at
            };
          }
        } catch (err) {
          console.error("Error accessing database cache:", err);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }
  
  // Save a response to the cache
  async saveResponse(cachedResponse: CachedResponse): Promise<void> {
    try {
      // Save to local cache first
      this.saveToLocalCache(cachedResponse);
      
      // If online, save to database
      if (supabase && cachedResponse.user_id) {
        try {
          const { error } = await supabase
            .from('response_cache')
            .insert({
              prompt_hash: this.hashString(cachedResponse.prompt),
              prompt: cachedResponse.prompt.substring(0, 1000), // Truncate if too long
              response: cachedResponse.response,
              provider: cachedResponse.provider,
              tokens_used: cachedResponse.tokens_used,
              user_id: cachedResponse.user_id,
              expires_at: this.getExpiryDate()
            });
            
          if (error) {
            console.error("Database cache save error:", error);
          }
        } catch (err) {
          console.error("Error saving to database cache:", err);
        }
      }
    } catch (error) {
      console.error("Cache save error:", error);
    }
  }
  
  // Clear cached responses older than specified days
  async clearOldCaches(days: number = 7): Promise<void> {
    try {
      // Clear local storage old items
      const localCache = this.getLocalCache();
      const now = new Date();
      const filtered = localCache.filter(item => {
        if (!item.created_at) return true;
        const created = new Date(item.created_at);
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      });
      
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      
      // If online, clear database old items
      if (supabase) {
        try {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          await supabase
            .from('response_cache')
            .delete()
            .lt('created_at', cutoffDate.toISOString());
        } catch (err) {
          console.error("Error clearing old database caches:", err);
        }
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
  
  // Get responses from local storage
  private getLocalCache(): CachedResponse[] {
    try {
      const cached = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error("Local cache read error:", error);
      return [];
    }
  }
  
  // Save a response to local storage
  private saveToLocalCache(cachedResponse: CachedResponse): void {
    try {
      const cache = this.getLocalCache();
      
      // Add timestamp if not present
      if (!cachedResponse.created_at) {
        cachedResponse.created_at = new Date().toISOString();
      }
      
      // Find if this prompt already exists
      const index = cache.findIndex(item => 
        item.prompt === cachedResponse.prompt && 
        item.provider === cachedResponse.provider);
      
      if (index >= 0) {
        // Update existing entry
        cache[index] = cachedResponse;
      } else {
        // Add new entry
        cache.push(cachedResponse);
      }
      
      // Limit cache size to prevent storage issues
      if (cache.length > 100) {
        cache.shift(); // Remove oldest entry
      }
      
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Local cache save error:", error);
    }
  }
  
  // Simple string hash function
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }
  
  // Get expiry date (7 days from now)
  private getExpiryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
