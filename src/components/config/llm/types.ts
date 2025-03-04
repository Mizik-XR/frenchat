
export interface AIModel {
  id: string;
  name: string;
  description: string;
  requiresKey?: boolean;
  docsUrl?: string;
  isCustom?: boolean;
  modelId?: string;
  apiKey?: string;
  temperature?: number;
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
    id: "mistral-local",
    name: "Mistral 7B",
    description: "Modèle local performant, recommandé par défaut"
  },
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
    id: "huggingface/mixtral",
    name: "Mixtral-8x7B",
    description: "Modèle performant via Hugging Face (recommandé)",
    requiresKey: false,
    modelId: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    apiType: "huggingface"
  },
  {
    id: "huggingface/phi-3",
    name: "Phi-3 (Microsoft)",
    description: "Modèle léger et efficace de Microsoft",
    requiresKey: false,
    modelId: "microsoft/phi-3-mini-4k-instruct",
    apiType: "huggingface"
  },
  {
    id: "huggingface/llama-3",
    name: "Llama-3 (Meta)",
    description: "Modèle polyvalent pour diverses tâches",
    requiresKey: false,
    modelId: "meta-llama/Llama-3-8B-Instruct",
    apiType: "huggingface"
  },
  {
    id: "huggingface/bert",
    name: "BERT",
    description: "Excellent pour l'analyse de texte",
    requiresKey: false,
    modelId: "bert-base-uncased",
    apiType: "huggingface"
  },
  {
    id: "huggingface/t5",
    name: "T5",
    description: "Efficace pour la génération et le résumé",
    requiresKey: false,
    modelId: "google/t5-base",
    apiType: "huggingface"
  },
  {
    id: "huggingface/falcon",
    name: "Falcon",
    description: "Alternative légère pour du texte",
    requiresKey: false,
    modelId: "tiiuae/falcon-7b-instruct",
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
    name: "GPT-4o mini",
    description: "Modèle rapide et économique d'OpenAI",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys",
    apiType: "openai",
    modelId: "gpt-4o-mini",
    configFields: {
      apiKey: true,
      temperature: true
    }
  },
  {
    id: "openai/gpt4o",
    name: "GPT-4o",
    description: "Modèle avancé d'OpenAI",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys",
    apiType: "openai",
    modelId: "gpt-4o",
    configFields: {
      apiKey: true,
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
