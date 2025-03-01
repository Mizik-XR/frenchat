
import { OllamaGenerationResponse, TextGenerationParameters, TextGenerationResponse } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Service spécifique pour les appels à Ollama
 */
export const callOllamaService = async (options: TextGenerationParameters, localAIUrl: string): Promise<TextGenerationResponse[]> => {
  if (!localAIUrl) {
    throw new Error("URL du service Ollama non configurée");
  }
  
  const modelName = options.model || 'mistral';
  
  const response = await fetch(`${localAIUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      prompt: options.inputs || options.prompt,
      system: options.system_prompt || "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.",
      temperature: options.parameters?.temperature || options.temperature || 0.7,
      top_p: options.parameters?.top_p || options.top_p || 0.9,
      max_tokens: options.parameters?.max_length || options.max_length || 800,
      stream: false
    }),
  });
  
  if (!response.ok) {
    // Vérifier si c'est une erreur de modèle non trouvé
    if (response.status === 404) {
      const errorData = await response.json();
      if (errorData.error && errorData.error.includes("model not found")) {
        // Proposer de télécharger le modèle automatiquement
        console.log("Le modèle n'existe pas, tentative de téléchargement...");
        
        try {
          const pullResponse = await fetch(`${localAIUrl}/api/pull`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: modelName
            }),
          });
          
          if (pullResponse.ok) {
            toast({
              title: "Téléchargement du modèle",
              description: `Le modèle ${modelName} est en cours de téléchargement. Veuillez réessayer dans quelques instants.`,
            });
            
            throw new Error(`Le modèle ${modelName} est en cours de téléchargement. Veuillez réessayer dans quelques instants.`);
          } else {
            throw new Error(`Impossible de télécharger le modèle ${modelName}.`);
          }
        } catch (pullError) {
          throw new Error(`Erreur lors du téléchargement du modèle: ${pullError.message}`);
        }
      }
    }
    
    throw new Error(`Erreur du service Ollama: ${response.status}`);
  }
  
  const data = await response.json() as OllamaGenerationResponse;
  return [{ generated_text: data.response }];
};
