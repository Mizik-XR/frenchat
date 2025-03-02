import { toast } from '@/hooks/use-toast';
import { AIServiceType, ModelDownloadStatus, TextGenerationParameters, TextGenerationResponse } from '../types';
import { callOllamaService } from '../ollamaService';
import { LLMProviderType } from '@/types/config';

/**
 * Stratégie pour exécuter la requête IA 
 * Cette fonction centralise les décisions d'envoi des requêtes
 */
export async function executeAIRequest(
  options: TextGenerationParameters,
  executionStrategy: 'local' | 'cloud',
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  cloudProvider: string = 'huggingface'
): Promise<TextGenerationResponse[]> {
  console.log(`Exécution de la requête IA avec stratégie: ${executionStrategy}`);
  
  // Si la stratégie est locale mais qu'un téléchargement est en cours, notifier l'utilisateur
  if (executionStrategy === 'local' && modelDownloadStatus.status === 'downloading') {
    const modelName = modelDownloadStatus.model || 'IA';
    const progress = Math.round(modelDownloadStatus.progress * 100);
    
    toast({
      title: "Téléchargement du modèle en cours",
      description: `Le modèle ${modelName} est en cours de téléchargement (${progress}%). Utilisation temporaire du mode cloud.`,
    });
    
    // Basculer temporairement vers le cloud
    executionStrategy = 'cloud';
  }

  try {
    // Exécution locale via API locale
    if (executionStrategy === 'local') {
      if (!localAIUrl) {
        throw new Error("URL du service IA local non configurée");
      }
      
      // Log pour debugger
      console.log(`Envoi de la requête au service local: ${localAIUrl}`);
      console.log(`Provider local: ${localProvider}`);
      
      // Cas particulier pour Ollama
      if (localProvider === 'ollama' || localAIUrl.includes('11434')) {
        return await callOllamaService(options, localAIUrl);
      }
      
      // Cas général: API locale Hugging Face / personnalisée
      const response = await fetch(`${localAIUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: options.inputs || options.prompt,
          system_prompt: options.system_prompt || "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.",
          temperature: options.parameters?.temperature || options.temperature || 0.7,
          top_p: options.parameters?.top_p || options.top_p || 0.9,
          max_length: options.parameters?.max_length || options.max_length || 800,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur du service local: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return [{ generated_text: data.generated_text || data.response || "" }];
    } 
    // Exécution cloud
    else {
      console.log("Exécution de la requête via service cloud");
      
      // Adapter l'URL en fonction du provider cloud
      let apiUrl = "https://api-inference.huggingface.co/models/";
      let model = options.model || "mistralai/Mistral-7B-Instruct-v0.1";
      
      // Construction de la requête cloud
      const cloudResponse = await fetch(`${apiUrl}${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Utiliser l'API key si disponible dans les options
          ...(options.api_key && { 'Authorization': `Bearer ${options.api_key}` })
        },
        body: JSON.stringify({
          inputs: options.inputs || `<s>[INST] ${options.system_prompt || ""}\n\n${options.prompt} [/INST]`,
          parameters: {
            temperature: options.parameters?.temperature || options.temperature || 0.7,
            top_p: options.parameters?.top_p || options.top_p || 0.9,
            max_new_tokens: options.parameters?.max_length || options.max_length || 800,
            return_full_text: false
          }
        }),
      });
      
      if (!cloudResponse.ok) {
        throw new Error(`Erreur du service cloud: ${cloudResponse.status} ${cloudResponse.statusText}`);
      }
      
      return await cloudResponse.json();
    }
  } catch (error: any) {
    console.error("Erreur d'exécution de la requête IA:", error);
    
    // Si l'erreur vient du mode local, on essaie de basculer vers le cloud automatiquement
    if (executionStrategy === 'local' && error.message?.includes('local')) {
      console.log("Tentative de basculement automatique vers le cloud suite à une erreur locale");
      
      toast({
        title: "Problème avec le service local",
        description: "Basculement automatique vers le service cloud. Vérifiez votre configuration locale.",
        variant: "default",
      });
      
      // Appel récursif avec stratégie cloud
      return executeAIRequest(options, 'cloud', localAIUrl, localProvider, modelDownloadStatus, cloudProvider);
    }
    
    throw error;
  }
}
