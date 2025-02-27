
import { LLMProvider, LLMProviderType } from "@/types/config";

// Correction des providers pour utiliser la nouvelle interface
export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "local",
    name: "Local (HuggingFace)",
    description: "Exécutez des modèles localement sans partager de données",
    models: ["transformers"],
    docsUrl: "https://huggingface.co/docs/transformers/installation",
    requiresApiKey: false,
    isLocal: true,
    setupInstructions: "Installez Python et les dépendances requises",
    type: "local" as LLMProviderType
  },
  {
    id: "huggingface",
    name: "Hugging Face (Cloud)",
    description: "Utilisez l'API Hugging Face pour accéder à une vaste gamme de modèles",
    models: ["mistral", "llama", "gpt2-xl"],
    docsUrl: "https://huggingface.co/docs/api-inference/index",
    requiresApiKey: false,
    type: "huggingface" as LLMProviderType
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Modèles locaux faciles à installer via Ollama",
    models: ["llama2", "mistral", "phi"],
    docsUrl: "https://ollama.ai/",
    requiresApiKey: false,
    type: "ollama" as LLMProviderType
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Utilisez GPT-4 et d'autres modèles avancés d'OpenAI",
    models: ["gpt-4", "gpt-3.5-turbo"],
    docsUrl: "https://platform.openai.com/docs/api-reference",
    requiresApiKey: true,
    type: "openai" as LLMProviderType
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Modèles Claude d'Anthropic, conçus pour être utiles et sûrs",
    models: ["claude-v2", "claude-instant-v1"],
    docsUrl: "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
    requiresApiKey: true,
    type: "anthropic" as LLMProviderType
  }
];

// Fonction utilitaire pour récupérer un provider par son ID
export function getProviderById(id: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find(provider => provider.id === id);
}
