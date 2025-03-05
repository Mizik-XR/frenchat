
import { toast } from '@/hooks/use-toast';
import { TextGenerationParameters, TextGenerationResponse, AIServiceType, ModelDownloadStatus } from '../types';
import { validateTextGenerationInput } from '../validation/inputValidation';
import { executeAIRequest } from '../strategies/aiServiceStrategy';
import { notifyServiceChange } from '../aiServiceUtils';
import { LLMProviderType } from '@/types/config';
import { estimateTokenCount } from '@/utils/chunking/smartChunking';

// Import des nouveaux modules refactorisés
import { optimizeTokenUsage } from './tokenManagement';
import { calculateTokenCost, checkUserCredits, logTokenUsage, deductUserCredits } from './creditManagement';
import { findCachedResponse, cacheResponse } from './cacheService';
import { determineExecutionStrategy } from './strategyManager';

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
    
    const prompt = options.prompt || options.inputs || '';
    const systemPrompt = options.system_prompt || '';
    
    // Si en mode cloud et que le cache est activé, vérifier d'abord le cache
    if ((serviceType === 'cloud' || isCloudModeForced) && !options.forceLocal) {
      const cachedResponse = await findCachedResponse(prompt, systemPrompt, provider, userId);
      if (cachedResponse) {
        return [{ generated_text: cachedResponse.response }];
      }
    }
    
    // Si mode cloud forcé, toujours utiliser la stratégie cloud
    const executionStrategy = isCloudModeForced ? 'cloud' : 
      await determineExecutionStrategy(options, serviceType).catch(err => {
        console.warn("Erreur lors de la détermination de la stratégie:", err);
        return 'cloud' as const; // Fallback en cas d'erreur
      });
    
    console.log(`Exécution avec la stratégie: ${executionStrategy} (forceCloud: ${isCloudModeForced})`);
    
    // Optimiser l'utilisation des tokens
    const { optimizedOptions, estimatedInputTokens } = optimizeTokenUsage(
      prompt, 
      systemPrompt, 
      provider, 
      options
    );
    
    // Vérifier si l'utilisateur a suffisamment de crédits (uniquement en mode cloud)
    if ((executionStrategy === 'cloud' || isCloudModeForced) && userId) {
      try {
        // Estimer le coût potentiel avant d'exécuter la requête
        const maxTokens = optimizedOptions.max_length || optimizedOptions.parameters?.max_length || 1500;
        const estimatedOutputTokens = maxTokens; // Cas du pire: utilisation de tous les tokens disponibles
        const totalEstimatedTokens = estimatedInputTokens + estimatedOutputTokens;
        const estimatedCost = calculateTokenCost(totalEstimatedTokens, provider);
        
        await checkUserCredits(userId, estimatedCost);
      } catch (creditError) {
        if (creditError instanceof Error && creditError.message?.includes('Crédit insuffisant')) {
          throw creditError; // Remonter l'erreur de crédit insuffisant
        }
        // Sinon continuer même en cas d'erreur de vérification
      }
    }
    
    // Exécuter la requête
    const response = await executeAIRequest(
      optimizedOptions, 
      executionStrategy, 
      localAIUrl, 
      localProvider, 
      modelDownloadStatus, 
      provider
    );
    
    // Mettre en cache la réponse si en mode cloud
    if ((executionStrategy === 'cloud' || isCloudModeForced) && response && response.length > 0) {
      const responseText = response[0].generated_text;
      const estimatedOutputTokens = estimateTokenCount(responseText);
      const totalTokens = estimatedInputTokens + estimatedOutputTokens;
      
      // Stocker dans le cache
      await cacheResponse(prompt, systemPrompt, responseText, provider, totalTokens);
      
      // Enregistrer l'utilisation et déduire les crédits
      if (userId) {
        await logTokenUsage(userId, estimatedInputTokens, estimatedOutputTokens, provider, false);
        const cost = calculateTokenCost(totalTokens, provider);
        if (cost > 0) {
          await deductUserCredits(userId, cost);
        }
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
