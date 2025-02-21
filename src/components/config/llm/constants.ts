
import { LLMProvider } from "@/types/config";

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Exécutez des modèles open source localement sur votre machine.',
    models: ['llama2', 'mistral', 'phi'],
    docsUrl: 'https://ollama.ai/download',
    requiresApiKey: false,
    isLocal: true,
    setupInstructions: `
      1. Téléchargez et installez Ollama depuis https://ollama.ai/download
      2. Ouvrez un terminal et exécutez : ollama run <nom-du-modèle>
      3. Le modèle sera automatiquement téléchargé et démarré
      4. L'application se connectera automatiquement au modèle local
    `
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Plateforme open source avec de nombreux modèles gratuits.',
    models: ['mistral-7b', 'llama-2', 'falcon-40b'],
    docsUrl: 'https://huggingface.co/docs/api-inference/index',
    requiresApiKey: false
  },
  {
    id: 'phi',
    name: 'Phi-3 (Open Source)',
    description: 'Modèle open source de Microsoft, optimisé pour les tâches de compréhension.',
    models: ['phi-3-small', 'phi-3-medium'],
    docsUrl: 'https://huggingface.co/microsoft/phi-3',
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
