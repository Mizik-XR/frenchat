
export interface AIModel {
  id: string;
  name: string;
  description: string;
  requiresKey?: boolean;
  docsUrl?: string;
  isCustom?: boolean;
  modelId?: string;
  apiKeyRequired?: boolean;
  apiType?: "openai" | "huggingface" | "other";
  configFields?: {
    apiKey?: boolean;
    modelName?: boolean;
    temperature?: boolean;
  };
}

export const LOCAL_MODELS: AIModel[] = [
  {
    id: "deepseek-local",
    name: "DeepSeek",
    description: "Modèle local DeepSeek optimisé pour le traitement rapide"
  },
  {
    id: "qwen-local",
    name: "Qwen 2.5",
    description: "Version locale de Qwen, rapide et efficace"
  },
  {
    id: "ollama-local",
    name: "Ollama",
    description: "Modèles locaux via Ollama, faciles à installer"
  },
  {
    id: "huggingface-custom",
    name: "Modèle Hugging Face personnalisé",
    description: "Utilisez n'importe quel modèle compatible de Hugging Face",
    isCustom: true
  }
];

export const CLOUD_MODELS: AIModel[] = [
  {
    id: "huggingface/mistral",
    name: "Mistral AI",
    description: "Modèle performant via Hugging Face (recommandé)",
    requiresKey: false,
    modelId: "mistralai/Mistral-7B-Instruct-v0.1",
    apiType: "huggingface"
  },
  {
    id: "anthropic/claude",
    name: "Claude (Anthropic)",
    description: "Assistant IA avancé (optionnel)",
    requiresKey: true,
    docsUrl: "https://console.anthropic.com/account/keys",
    apiType: "other",
    configFields: {
      apiKey: true
    }
  },
  {
    id: "openai/gpt4",
    name: "GPT-4 (OpenAI)",
    description: "Modèle avancé OpenAI (optionnel)",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys",
    apiType: "openai",
    configFields: {
      apiKey: true,
      modelName: true,
      temperature: true
    }
  },
  {
    id: "openai/gpt35",
    name: "GPT-3.5 Turbo",
    description: "Version rapide et économique de GPT",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys",
    apiType: "openai",
    configFields: {
      apiKey: true,
      modelName: true,
      temperature: true
    }
  },
  {
    id: "perplexity/pplx",
    name: "Perplexity AI",
    description: "API Perplexity (optionnel)",
    requiresKey: true,
    docsUrl: "https://docs.perplexity.ai/docs/getting-started",
    apiType: "other",
    configFields: {
      apiKey: true
    }
  }
];
