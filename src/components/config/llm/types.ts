
export interface AIModel {
  id: string;
  name: string;
  description: string;
  requiresKey?: boolean;
  docsUrl?: string;
  isCustom?: boolean;
  modelId?: string;
}

export const LOCAL_MODELS: AIModel[] = [
  {
    id: "deepseek-local",
    name: "DeepSeek",
    description: "Modèle local DeepSeek optimisé"
  },
  {
    id: "qwen-local",
    name: "Qwen 2.5",
    description: "Version locale de Qwen (léger et rapide)"
  },
  {
    id: "ollama-local",
    name: "Ollama",
    description: "Modèles locaux via Ollama"
  },
  {
    id: "huggingface-custom",
    name: "Modèle Hugging Face personnalisé",
    description: "Utilisez n'importe quel modèle Hugging Face compatible",
    isCustom: true
  }
];

export const CLOUD_MODELS: AIModel[] = [
  {
    id: "huggingface/mistral",
    name: "Mistral AI",
    description: "Modèle performant via Hugging Face",
    requiresKey: false
  },
  {
    id: "anthropic/claude",
    name: "Claude (Anthropic)",
    description: "Assistant IA avancé (optionnel)",
    requiresKey: true,
    docsUrl: "https://console.anthropic.com/account/keys"
  },
  {
    id: "openai/gpt4",
    name: "GPT-4 (OpenAI)",
    description: "Modèle avancé OpenAI (optionnel)",
    requiresKey: true,
    docsUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "perplexity/pplx",
    name: "Perplexity AI",
    description: "API Perplexity (optionnel)",
    requiresKey: true,
    docsUrl: "https://docs.perplexity.ai/docs/getting-started"
  }
];
