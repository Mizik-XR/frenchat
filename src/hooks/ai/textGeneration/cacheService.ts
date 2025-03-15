
import { cacheService } from '@/services/cacheService';
import { logTokenUsage } from './creditManagement';

/**
 * Gère le cache des réponses générées
 */
export async function findCachedResponse(
  prompt: string,
  systemPrompt: string,
  provider: string,
  userId?: string
): Promise<{ response: string, tokens_used: number } | null> {
  try {
    const cachedResponse = await cacheService.findCachedResponse(
      prompt, 
      systemPrompt, 
      provider
    );
    
    if (cachedResponse) {
      console.log(`Réponse trouvée en cache (${cachedResponse.tokens_used} tokens)`);
      
      // Enregistrer l'utilisation dans les statistiques
      if (userId) {
        try {
          await logTokenUsage(
            userId,
            0,
            0,
            provider,
            true
          );
        } catch (logError) {
          console.error("Erreur lors de l'enregistrement de l'utilisation du cache:", logError);
        }
      }
      
      return cachedResponse;
    }
    
    return null;
  } catch (cacheError) {
    console.warn("Erreur lors de la vérification du cache:", cacheError);
    return null;
  }
}

/**
 * Stocke une réponse dans le cache
 */
export async function cacheResponse(
  prompt: string,
  systemPrompt: string,
  responseText: string,
  provider: string,
  totalTokens: number
): Promise<void> {
  try {
    await cacheService.cacheResponse(
      prompt,
      systemPrompt,
      responseText,
      provider,
      totalTokens
    );
    
    console.log(`Réponse mise en cache (${totalTokens} tokens estimés)`);
  } catch (cacheError) {
    console.warn("Erreur lors de la mise en cache:", cacheError);
  }
}
