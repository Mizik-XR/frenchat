
import { checkLocalService, notifyServiceChange } from '../aiServiceUtils';
import { callCloudAPIService } from '../cloudAPIService';
import { callOllamaService } from '../ollamaService';
import { callLocalAPIService } from '../localAPIService';
import { TextGenerationParameters, TextGenerationResponse, ModelDownloadStatus } from '../types';

/**
 * Utilitaire pour gérer les services d'IA et l'exécution des requêtes
 */
export const executeAIRequest = async (
  options: TextGenerationParameters,
  serviceType: string,
  localAIUrl: string | null,
  localProvider: string,
  modelDownloadStatus: ModelDownloadStatus | null,
  provider = 'huggingface'
): Promise<TextGenerationResponse[]> => {
  // Vérifier d'abord si le service local est disponible si nous sommes en mode local
  if (serviceType === 'local') {
    const isLocalAvailable = await checkLocalService(localAIUrl || undefined);
    
    if (isLocalAvailable && localAIUrl) {
      console.log(`Utilisation du service IA local (${localProvider}):`, localAIUrl);
      
      // Vérifier si un téléchargement est en cours
      if (modelDownloadStatus?.status === 'downloading') {
        console.log("Téléchargement de modèle en cours, utilisation du fallback cloud temporaire");
        notifyServiceChange(
          "Modèle en cours de téléchargement", 
          `Le modèle est en cours de téléchargement (${modelDownloadStatus.progress}%). Utilisation temporaire du service cloud.`,
          "default"
        );
        return await callCloudAPIService(options, provider);
      }
      
      // Utiliser Ollama si c'est le fournisseur configuré ou si l'URL contient 11434 (port standard d'Ollama)
      if (localProvider === 'ollama' || localAIUrl.includes('11434')) {
        return await callOllamaService(options, localAIUrl);
      }
      
      // Sinon, utiliser le serveur IA local standard (Hugging Face)
      return await callLocalAPIService(options, localAIUrl);
    } else {
      console.warn("Service local indisponible, passage au service cloud");
      // Si le service local est indisponible, on passe automatiquement au service cloud
      notifyServiceChange(
        "Service local indisponible", 
        "Impossible de se connecter au service IA local. Utilisation du service cloud."
      );
      return await callCloudAPIService(options, provider);
    }
  }
  
  // Si nous sommes ici, c'est que nous utilisons le service cloud
  console.log("Utilisation du service IA cloud via Supabase Functions");
  return await callCloudAPIService(options, provider);
};
