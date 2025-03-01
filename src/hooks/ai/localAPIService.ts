
import { TextGenerationParameters, TextGenerationResponse } from './types';

/**
 * Service pour les appels à l'API locale (non-Ollama)
 */
export const callLocalAPIService = async (
  options: TextGenerationParameters, 
  localAIUrl: string
): Promise<TextGenerationResponse[]> => {
  const systemPrompt = options.system_prompt || 
    "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
  
  const response = await fetch(`${localAIUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.inputs || options.prompt,
      max_length: options.parameters?.max_length || options.max_length || 800,
      temperature: options.parameters?.temperature || options.temperature || 0.7,
      top_p: options.parameters?.top_p || options.top_p || 0.9,
      system_prompt: systemPrompt
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Erreur du service local: ${response.status}`);
  }
  
  const data = await response.json();
  return [{ generated_text: data.generated_text }];
};
