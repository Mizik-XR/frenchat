
import { LLMProvider } from "@/types/config";

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Plateforme open source avec de nombreux modèles gratuits.',
    models: ['mistral-7b', 'llama-2', 'falcon-40b'],
    docsUrl: 'https://huggingface.co/docs/api-inference/index',
    requiresApiKey: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Service payant avec d\'excellentes performances. Nécessite une clé API.',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    requiresApiKey: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Alternative performante pour les tâches spécialisées. Nécessite une clé API.',
    models: ['deepseek-coder', 'deepseek-chat'],
    docsUrl: 'https://github.com/deepseek-ai/DeepSeek-LLM',
    requiresApiKey: true
  }
];
