
import { toast } from '@/hooks/use-toast';
import { TextGenerationParameters, AIServiceType, TextGenerationResponse, ModelDownloadStatus } from '../types';
import { executeAIRequest } from '../strategies/aiServiceStrategy';
import { notifyServiceChange } from '../aiServiceUtils';
import { LLMProviderType } from '@/types/config';

export async function handleTextGenerationError(
  error: any,
  serviceType: AIServiceType,
  options: TextGenerationParameters,
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  provider: string,
) {
  console.error("Erreur lors de l'appel au modèle:", error);
  
  if (serviceType === 'hybrid') {
    // En mode hybride, on tente de basculer d'une stratégie à l'autre en cas d'erreur
    try {
      console.log("Tentative de basculement automatique en mode hybride");
      const fallbackStrategy = options.forceLocal ? 'cloud' : 'local';
      
      // Forcer la stratégie opposée
      const fallbackOptions = { 
        ...options,
        forceLocal: fallbackStrategy === 'local', 
        forceCloud: fallbackStrategy === 'cloud'
      };
      
      toast({
        title: "Basculement automatique",
        description: `Tentative d'utilisation du service ${fallbackStrategy === 'local' ? 'local' : 'cloud'}`,
        variant: "default"
      });
      
      const fallbackResponse = await executeAIRequest(
        fallbackOptions, 
        fallbackStrategy, 
        localAIUrl, 
        localProvider, 
        modelDownloadStatus, 
        provider
      );
      
      return fallbackResponse;
    } catch (fallbackError) {
      console.error("Échec du basculement automatique:", fallbackError);
      // Si le basculement échoue également, on rejette avec l'erreur d'origine
      throw error;
    }
  } else {
    // En mode non-hybride, on affiche simplement l'erreur
    notifyServiceChange(
      "Erreur de connexion au service d'IA",
      "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
      "destructive"
    );
    
    throw error;
  }
}

export function logExecutionStrategy(
  serviceType: AIServiceType,
  executionStrategy: 'local' | 'cloud'
) {
  if (serviceType === 'local' && executionStrategy === 'cloud') {
    console.log("Basculement temporaire vers le cloud");
  } else if (serviceType === 'hybrid') {
    console.log(`Mode hybride: utilisation de la stratégie ${executionStrategy}`);
  }
}
