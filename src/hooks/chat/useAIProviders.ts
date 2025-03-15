
import { WebUIConfig, AIProvider } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { useAuth } from "@/components/AuthProvider";

export function useAIProviders() {
  const { textGeneration, serviceType, localAIUrl } = useHuggingFace();
  const { user } = useAuth();
  
  const getSystemPrompt = (mode: string) => {
    switch (mode) {
      case 'analysis':
        return `Tu es un assistant analytique qui fournit des réponses détaillées et approfondies. 
                Analyse en profondeur tous les aspects de la question.`;
      case 'summary':
        return `Tu es un assistant concis qui fournit des résumés clairs et synthétiques. 
                Va droit à l'essentiel en quelques points clés.`;
      case 'action':
        return `Tu es un assistant orienté action qui fournit des étapes concrètes et pratiques. 
                Structure ta réponse en étapes numérotées.`;
      default:
        return `Tu es un assistant polyvalent qui aide les utilisateurs en s'adaptant à leurs besoins.`;
    }
  };

  const generateWithHuggingFace = async (prompt: string, webUIConfig: WebUIConfig) => {
    return await textGeneration({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      inputs: `[INST] ${getSystemPrompt(webUIConfig.analysisMode)}\n\n${prompt} [/INST]`,
      parameters: {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        top_p: 0.95,
      }
    }, user?.id);
  };

  const generateWithDeepseek = async (prompt: string, webUIConfig: WebUIConfig) => {
    const { data, error } = await supabase.functions.invoke('text-generation', {
      body: { 
        model: "deepseek-ai/deepseek-coder-33b-instruct", 
        prompt: `${getSystemPrompt(webUIConfig.analysisMode)}\n\n${prompt}`,
        max_tokens: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        userId: user?.id
      }
    });
    
    if (error) throw error;
    return [{ generated_text: data.text }];
  };

  const generateWithInternetSearch = async (message: string) => {
    const { data, error } = await supabase.functions.invoke('web-search', {
      body: { 
        query: message,
        userId: user?.id
      }
    });
    if (error) throw error;
    return [{ generated_text: data.results }];
  };

  const generateWithMistral = async (prompt: string, webUIConfig: WebUIConfig) => {
    return await textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      inputs: prompt,
      parameters: {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature
      }
    }, user?.id);
  };

  const generateWithGemma = async (prompt: string, webUIConfig: WebUIConfig) => {
    return await textGeneration({
      model: "google/gemma-3-8b-it",
      inputs: `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model`,
      parameters: {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        top_p: 0.95
      }
    }, user?.id);
  };

  const generateWithDeepseekV2 = async (prompt: string, webUIConfig: WebUIConfig) => {
    const { data, error } = await supabase.functions.invoke('text-generation', {
      body: { 
        model: "deepseek-ai/deepseek-coder-v2-instruct", 
        prompt: `${getSystemPrompt(webUIConfig.analysisMode)}\n\n${prompt}`,
        max_tokens: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        userId: user?.id
      }
    });
    
    if (error) throw error;
    return [{ generated_text: data.text }];
  };

  const generateWithOllama = async (prompt: string, webUIConfig: WebUIConfig) => {
    return await textGeneration({
      model: "ollama/mistral",
      inputs: prompt,
      parameters: {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature
      },
      forceLocal: true
    }, user?.id);
  };

  const generateWithOllamaGemma = async (prompt: string, webUIConfig: WebUIConfig) => {
    return await textGeneration({
      model: "ollama/gemma:3",
      inputs: prompt,
      parameters: {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature
      },
      forceLocal: true
    }, user?.id);
  };

  const generateResponse = async (
    message: string, 
    prompt: string, 
    provider: AIProvider,
    webUIConfig: WebUIConfig
  ) => {
    switch (provider) {
      case 'huggingface':
        return await generateWithHuggingFace(prompt, webUIConfig);
      case 'deepseek':
        return await generateWithDeepseek(prompt, webUIConfig);
      case 'deepseek-v2':
        return await generateWithDeepseekV2(prompt, webUIConfig);
      case 'internet-search':
        return await generateWithInternetSearch(message);
      case 'mistral':
        return await generateWithMistral(prompt, webUIConfig);
      case 'gemma-3':
        return await generateWithGemma(prompt, webUIConfig);  
      case 'ollama':
        return await generateWithOllama(prompt, webUIConfig);
      case 'ollama-gemma':
        return await generateWithOllamaGemma(prompt, webUIConfig);
      default:
        return await generateWithHuggingFace(prompt, webUIConfig);
    }
  };

  return {
    generateResponse,
    serviceType,
    localAIUrl,
    getSystemPrompt
  };
}
