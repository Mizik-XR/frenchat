
import { toast } from '@/hooks/use-toast';
import { TextGenerationParameters, TextGenerationResponse, AIServiceType, ModelDownloadStatus } from '../types';
import { validateTextGenerationInput } from '../validation/inputValidation';
import { executeAIRequest } from '../strategies/aiServiceStrategy';
import { notifyServiceChange } from '../aiServiceUtils';
import { LLMProviderType } from '@/types/config';

/**
 * Fonction centrale pour la génération de texte
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
  setError: (error: string | null) => void
): Promise<TextGenerationResponse[]> {
  setIsLoading(true);
  setError(null);
  
  try {
    // Validation des entrées
    const validationError = validateTextGenerationInput(options);
    if (validationError) {
      throw new Error(`Erreur de validation: ${validationError}`);
    }
    
    // Si mode cloud forcé, toujours utiliser la stratégie cloud
    const executionStrategy = isCloudModeForced ? 'cloud' : 
      await determineExecutionStrategy(options, serviceType).catch(err => {
        console.warn("Erreur lors de la détermination de la stratégie:", err);
        return 'cloud' as const; // Fallback en cas d'erreur
      });
    
    console.log(`Exécution avec la stratégie: ${executionStrategy} (forceCloud: ${isCloudModeForced})`);
    
    const response = await executeAIRequest(
      options, 
      executionStrategy, 
      localAIUrl, 
      localProvider, 
      modelDownloadStatus, 
      provider
    );
    
    if (serviceType === 'local' && executionStrategy === 'cloud') {
      console.log("Basculement temporaire vers le cloud");
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
