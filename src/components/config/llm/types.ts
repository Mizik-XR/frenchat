
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
  apiType?: "openai" | "huggingface" | "other" | "google";
  configFields?: {
    apiKey?: boolean;
    modelName?: boolean;
    temperature?: boolean;
  };
  isOpenSource?: boolean;
  pricingInfo?: string;
}

export const LOCAL_MODELS: AIModel[] = [
  {
    id: "mistral-local",
    name: "Mistral 7B",
    description: "Modèle local performant, recommandé par défaut",
    isOpenSource: true,
    pricingInfo: "Gratuit, exécution locale"
  },
  {
    id: "deepseek-local",
    name: "DeepSeek",
    description: "Modèle local DeepSeek optimisé pour le traitement rapide",
    isOpenSource: true,
    pricingInfo: "Gratuit, exécution locale"
  },
  {
    id: "qwen-local",
    name: "Qwen 2.5",
    description: "Version locale de Qwen, rapide et efficace",
    isOpenSource: true,
    pricingInfo: "Gratuit, exécution locale"
  },
  {
    id: "gemma-3-local",
    name: "Gemma 3 (Local)",
    description: "Modèle Gemma 3 de Google optimisé pour exécution locale",
    isOpenSource: true,
    pricingInfo: "Gratuit, exécution locale via Ollama"
  },
  {
    id: "ollama-local",
    name: "Ollama",
    description: "Modèles locaux via Ollama, faciles à installer",
    isOpenSource: true,
    pricingInfo: "Gratuit, exécution locale via Ollama"
  },
  {
    id: "huggingface-custom",
    name: "Modèle Hugging Face personnalisé",
    description: "Utilisez n'importe quel modèle compatible de Hugging Face",
    isCustom: true,
    isOpenSource: true,
    pricingInfo: "Gratuit ou payant selon le modèle choisi"
  }
];

export const CLOUD_MODELS: AIModel[] = [
  {
    id: "huggingface/mixtral",
    name: "Mixtral-8x7B",
    description: "Modèle performant via Hugging Face (recommandé)",
    requiresKey: false,
    modelId: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "huggingface/phi-3",
    name: "Phi-3 (Microsoft)",
    description: "Modèle léger et efficace de Microsoft",
    requiresKey: false,
    modelId: "microsoft/phi-3-mini-4k-instruct",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "huggingface/llama-3",
    name: "Llama-3 (Meta)",
    description: "Modèle polyvalent pour diverses tâches",
    requiresKey: false,
    modelId: "meta-llama/Llama-3-8B-Instruct",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "huggingface/gemma-3",
    name: "Gemma 3 (Google)",
    description: "Nouveau modèle ultra-performant de Google",
    requiresKey: false,
    modelId: "google/gemma-3-8b-it",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "deepseek/deepseek-coder-v2",
    name: "DeepSeek Coder V2",
    description: "Dernière version du modèle spécialisé pour le code",
    requiresKey: true,
    modelId: "deepseek-ai/deepseek-coder-v2-instruct",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Via API Hugging Face (clé requise)"
  },
  {
    id: "huggingface/bert",
    name: "BERT",
    description: "Excellent pour l'analyse de texte",
    requiresKey: false,
    modelId: "bert-base-uncased",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "huggingface/t5",
    name: "T5",
    description: "Efficace pour la génération et le résumé",
    requiresKey: false,
    modelId: "google/t5-base",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
  },
  {
    id: "huggingface/falcon",
    name: "Falcon",
    description: "Alternative légère pour du texte",
    requiresKey: false,
    modelId: "tiiuae/falcon-7b-instruct",
    apiType: "huggingface",
    isOpenSource: true,
    pricingInfo: "Gratuit via l'API Hugging Face"
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
    },
    isOpenSource: false,
    pricingInfo: "Service payant (~$15/million de tokens)"
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
    },
    isOpenSource: false,
    pricingInfo: "Service payant (~$5/million de tokens)"
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
    },
    isOpenSource: false,
    pricingInfo: "Service payant (~$15/million de tokens)"
  },
  {
    id: "google/gemini-pro",
    name: "Gemini Pro (Google)",
    description: "Modèle avancé de Google AI",
    requiresKey: true,
    docsUrl: "https://aistudio.google.com/app/apikey",
    apiType: "google",
    configFields: {
      apiKey: true
    },
    isOpenSource: false,
    pricingInfo: "Service payant (tarification variable)"
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
    },
    isOpenSource: false,
    pricingInfo: "Service payant (tarification variable)"
  }
];
