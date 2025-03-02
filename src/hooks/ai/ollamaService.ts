
import { TextGenerationParameters, TextGenerationResponse, OllamaGenerationResponse } from './types';

/**
 * Fonction spécifique pour appeler Ollama
 */
export async function callOllamaService(
  options: TextGenerationParameters,
  ollamaUrl: string
): Promise<TextGenerationResponse[]> {
  console.log("Appel au service Ollama", ollamaUrl);
  
  const modelName = options.model || 'mistral';
  const prompt = options.inputs || options.prompt || '';
  const systemPrompt = options.system_prompt || "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante.";
  
  // Adapter le format selon ce qu'Ollama attend
  const body = {
    model: modelName,
    prompt: `${systemPrompt}\n\n${prompt}`,
    stream: false,
    options: {
      temperature: options.parameters?.temperature || options.temperature || 0.7,
      top_p: options.parameters?.top_p || options.top_p || 0.9,
      num_predict: options.parameters?.max_length || options.max_length || 800
    }
  };
  
  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur du service Ollama: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data: OllamaGenerationResponse = await response.json();
    return [{ generated_text: data.response }];
  } catch (error) {
    console.error("Erreur lors de l'appel au service Ollama:", error);
    throw error;
  }
}
