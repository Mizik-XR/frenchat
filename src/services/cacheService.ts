
/**
 * Service de mise en cache des réponses IA pour optimiser les coûts
 */
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export interface CachedResponse {
  id: string;
  prompt: string;
  response: string;
  provider: string;
  tokens_used: number;
  created_at: Date;
  expiration_date: Date | null;
  hash: string;
}

export const cacheService = {
  /**
   * Génère un hash unique pour un prompt donné
   */
  generateHash(prompt: string, systemPrompt: string, provider: string): string {
    // Normalisation: supprimer les espaces superflus, convertir en minuscules
    const normalizedPrompt = prompt.trim().toLowerCase();
    const normalizedSystem = (systemPrompt || "").trim().toLowerCase();
    
    // Combiner prompt et système pour le hash
    const combined = `${normalizedSystem}|${normalizedPrompt}|${provider}`;
    
    // Hash simple avec algo djb2
    let hash = 5381;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    }
    
    return String(Math.abs(hash));
  },
  
  /**
   * Cherche une réponse en cache
   */
  async findCachedResponse(prompt: string, systemPrompt: string, provider: string): Promise<CachedResponse | null> {
    const hash = this.generateHash(prompt, systemPrompt, provider);
    
    // Utiliser la requête avec RLS (les politiques filtreron automatiquement)
    const { data, error } = await supabase
      .from('response_cache')
      .select('*')
      .eq('hash', hash)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    // Vérifier si la réponse en cache est expirée
    const cachedResponse = data[0] as CachedResponse;
    if (cachedResponse.expiration_date && new Date(cachedResponse.expiration_date) < new Date()) {
      return null;
    }
    
    return cachedResponse;
  },
  
  /**
   * Stocke une réponse en cache
   */
  async cacheResponse(
    prompt: string, 
    systemPrompt: string, 
    response: string, 
    provider: string, 
    tokensUsed: number,
    expirationDays: number = 7,
    userId?: string
  ): Promise<string> {
    const hash = this.generateHash(prompt, systemPrompt, provider);
    const id = uuidv4();
    
    // Calcul de la date d'expiration
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    
    const { error } = await supabase
      .from('response_cache')
      .insert({
        id,
        prompt,
        system_prompt: systemPrompt,
        response,
        provider,
        tokens_used: tokensUsed,
        hash,
        expiration_date: expirationDate.toISOString(),
        user_id: userId || null // Associer au user_id si disponible, sinon cache public
      });
    
    if (error) {
      console.error("Erreur lors de la mise en cache:", error);
      throw error;
    }
    
    return id;
  },
  
  /**
   * Purge les entrées de cache expirées
   */
  async purgeExpiredCache(): Promise<number> {
    const now = new Date().toISOString();
    
    // Les politiques RLS s'appliqueront automatiquement ici aussi
    const { data, error } = await supabase
      .from('response_cache')
      .delete()
      .lt('expiration_date', now)
      .select('id');
    
    if (error) {
      console.error("Erreur lors de la purge du cache:", error);
      throw error;
    }
    
    return data?.length || 0;
  }
};
