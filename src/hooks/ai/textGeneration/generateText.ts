import { toast } from '@/hooks/use-toast';
import { TextGenerationParameters, TextGenerationResponse, AIServiceType, ModelDownloadStatus } from '../types';
import { validateTextGenerationInput } from '../validation/inputValidation';
import { executeAIRequest } from '../strategies/aiServiceStrategy';
import { notifyServiceChange } from '../aiServiceUtils';
import { LLMProviderType } from '@/types/config';
import { cacheService } from '@/services/cacheService';
import { truncateToMaxTokens, estimateTokenCount } from '@/utils/chunking/smartChunking';
import { useUserCreditUsage } from '@/hooks/user/useUserCreditUsage';

const DEFAULT_TOKEN_LIMITS: Record<string, number> = {
  'openai': 2000,
  'anthropic': 4000,
  'deepseek': 2000,
  'huggingface': 1000,
  'mistral': 3000,
  'default': 1500
};

/**
 * Fonction centrale pour la génération de texte avec optimisations
 */
export async function generateText(
  options: TextGenerationParameters,
  serviceType: AIServiceType,
  isCloudModeForced: boolean,
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  provider: string,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void,
  userId?: string
): Promise<TextGenerationResponse[]> {
  setIsLoading(true);
  setError(null);
  
  try {
    // Validation des entrées
    const validationError = validateTextGenerationInput(options);
    if (validationError) {
      throw new Error(`Erreur de validation: ${validationError}`);
    }
    
    // Appliquer les limites de tokens si nécessaire
    const maxTokens = options.max_length || options.parameters?.max_length || 
      DEFAULT_TOKEN_LIMITS[provider] || DEFAULT_TOKEN_LIMITS.default;
    
    const prompt = options.prompt || options.inputs || '';
    const systemPrompt = options.system_prompt || '';
    
    // Si en mode cloud et que le cache est activé, vérifier d'abord le cache
    if ((serviceType === 'cloud' || isCloudModeForced) && !options.forceLocal) {
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
          
          return [{ generated_text: cachedResponse.response }];
        }
      } catch (cacheError) {
        console.warn("Erreur lors de la vérification du cache:", cacheError);
        // Continue avec la génération normale si le cache échoue
      }
    }
    
    // Si mode cloud forcé, toujours utiliser la stratégie cloud
    const executionStrategy = isCloudModeForced ? 'cloud' : 
      await determineExecutionStrategy(options, serviceType).catch(err => {
        console.warn("Erreur lors de la détermination de la stratégie:", err);
        return 'cloud' as const; // Fallback en cas d'erreur
      });
    
    console.log(`Exécution avec la stratégie: ${executionStrategy} (forceCloud: ${isCloudModeForced})`);
    
    // Estimer les tokens d'entrée
    const estimatedInputTokens = estimateTokenCount(prompt) + estimateTokenCount(systemPrompt);
    
    // Vérifier si la longueur du prompt dépasse les limites
    if (estimatedInputTokens > maxTokens * 2) {
      const truncatedPrompt = truncateToMaxTokens(prompt, maxTokens);
      console.warn(`Prompt tronqué de ${prompt.length} à ${truncatedPrompt.length} caractères`);
      
      if (options.prompt) options.prompt = truncatedPrompt;
      if (options.inputs) options.inputs = truncatedPrompt;
    }
    
    // Limiter explicitement les tokens de sortie
    if (options.parameters) {
      options.parameters.max_length = maxTokens;
    } else if (options.max_length) {
      options.max_length = maxTokens;
    } else {
      options.parameters = { max_length: maxTokens };
    }
    
    // Exécuter la requête
    const response = await executeAIRequest(
      options, 
      executionStrategy, 
      localAIUrl, 
      localProvider, 
      modelDownloadStatus, 
      provider
    );
    
    // Mettre en cache la réponse si en mode cloud
    if ((executionStrategy === 'cloud' || isCloudModeForced) && response && response.length > 0) {
      try {
        const responseText = response[0].generated_text;
        const estimatedOutputTokens = estimateTokenCount(responseText);
        const totalTokens = estimatedInputTokens + estimatedOutputTokens;
        
        await cacheService.cacheResponse(
          prompt,
          systemPrompt,
          responseText,
          provider,
          totalTokens
        );
        
        // Enregistrer l'utilisation dans les statistiques
        if (userId) {
          await logTokenUsage(
            userId,
            estimatedInputTokens,
            estimatedOutputTokens,
            provider,
            false
          );
        }
        
        console.log(`Réponse mise en cache (${totalTokens} tokens estimés)`);
      } catch (cacheError) {
        console.warn("Erreur lors de la mise en cache:", cacheError);
      }
    }
    
    return response;
  } catch (e) {
    console.error("Erreur lors de l'appel au modèle:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    setError(errorMessage);
    
    // Ne pas afficher de notification en cas de mode cloud forcé et erreur locale
    if (!isCloudModeForced || (isCloudModeForced && serviceType === 'cloud')) {
      notifyServiceChange(
        "Erreur de connexion au service d'IA",
        "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
        "destructive"
      );
    }
    
    // Toujours renvoyer une réponse même en cas d'erreur pour éviter le blocage de l'UI
    return [{ generated_text: "Désolé, je n'ai pas pu générer de réponse en raison d'une erreur de connexion. Veuillez réessayer." }];
  } finally {
    setIsLoading(false);
  }
}

/**
 * Détermine la stratégie d'exécution appropriée
 */
async function determineExecutionStrategy(
  options: TextGenerationParameters,
  serviceType: AIServiceType
): Promise<'local' | 'cloud'> {
  // Option forcée localement
  if (options.forceLocal === true) {
    return 'local';
  }
  
  // Option forcée vers le cloud
  if (options.forceCloud === true) {
    return 'cloud';
  }
  
  // Utiliser le type de service configuré
  if (serviceType === 'local') {
    return 'local';
  } else if (serviceType === 'cloud') {
    return 'cloud';
  }
  
  // Par défaut, utiliser le cloud pour hybrid
  return 'cloud';
}

/**
 * Enregistre l'utilisation des tokens pour les statistiques et la facturation
 */
async function logTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
  provider: string,
  fromCache: boolean
): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Calculer le coût estimé en fonction du fournisseur
    const costPerToken = getProviderCostPerToken(provider);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = fromCache ? 0 : totalTokens * costPerToken;
    
    await supabase
      .from('ai_usage_metrics')
      .insert({
        user_id: userId,
        provider,
        tokens_input: inputTokens,
        tokens_output: outputTokens,
        estimated_cost: estimatedCost,
        from_cache: fromCache,
        operation_type: 'chat'
      });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisation des tokens:", error);
  }
}

/**
 * Retourne le coût estimé par token pour un fournisseur donné
 */
function getProviderCostPerToken(provider: string): number {
  // Coûts approximatifs par token en USD (entrée + sortie moyennée)
  const costs: Record<string, number> = {
    'openai-gpt4': 0.00003,
    'openai-gpt35': 0.000005,
    'anthropic-claude': 0.00002,
    'mistral': 0.000007,
    'huggingface': 0.000002,
    'deepseek': 0.000008,
    'default': 0.00001
  };
  
  // Déterminer le modèle spécifique du fournisseur
  if (provider.includes('gpt-4')) {
    return costs['openai-gpt4'];
  } else if (provider.includes('gpt-3')) {
    return costs['openai-gpt35'];
  } else if (provider.includes('claude')) {
    return costs['anthropic-claude'];
  } else if (provider.includes('mistral')) {
    return costs['mistral'];
  } else if (provider.includes('hugging') || provider.includes('hf')) {
    return costs['huggingface'];
  } else if (provider.includes('deepseek')) {
    return costs['deepseek'];
  }
  
  return costs['default'];
}
