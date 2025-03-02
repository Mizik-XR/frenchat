
/**
 * Types communs pour les services d'IA
 */

export type AIServiceType = 'local' | 'cloud' | 'hybrid';

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxLength: number;
  requiresKey: boolean;
};

export type ModelDownloadStatus = {
  status: 'idle' | 'downloading' | 'completed' | 'error';
  progress: number;
  model?: string;
  error?: string;
  // Propriétés additionnelles pour le suivi du téléchargement
  started_at?: number | null;
  completed_at?: number | null;
  size_mb?: number;
  downloaded_mb?: number;
};

export interface ModelDownloadRequest {
  model: string;
  consent: boolean;
}

export interface TextGenerationParameters {
  model?: string;
  inputs?: string;
  prompt?: string;
  system_prompt?: string;
  parameters?: {
    temperature?: number;
    top_p?: number;
    max_length?: number;
    top_k?: number;
    repetition_penalty?: number;
  };
  temperature?: number;
  top_p?: number;
  max_length?: number;
  api_key?: string;
  forceLocal?: boolean;
  forceCloud?: boolean;
}

export interface TextGenerationResponse {
  generated_text: string;
}

export interface OllamaGenerationResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface LocalModelConfig {
  model_path: string;
  provider: 'huggingface' | 'ollama' | 'custom';
  url: string;
  default_model: string;
  use_gpu: boolean;
}

export interface CloudModelConfig {
  provider: 'huggingface' | 'openai' | 'anthropic' | 'custom';
  api_key?: string;
  default_model: string;
}

export interface HybridModelConfig {
  default_service: AIServiceType;
  local_fallback: boolean;
  cloud_fallback: boolean;
  local_config: LocalModelConfig;
  cloud_config: CloudModelConfig;
}
