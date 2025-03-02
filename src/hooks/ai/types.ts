// Type pour les paramètres de génération de texte
export interface TextGenerationParameters {
  inputs?: string;
  prompt?: string;
  model?: string;
  max_length?: number;
  maxLength?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  system_prompt?: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
  forceLocal?: boolean;
  forceCloud?: boolean;
  api_key?: string;
}

// Type pour la réponse de génération de texte
export interface TextGenerationResponse {
  generated_text: string;
}

// Type pour la réponse d'Ollama
export interface OllamaGenerationResponse {
  model: string;
  response: string;
  done: boolean;
}

// Type pour le service IA
export type AIServiceType = 'local' | 'cloud' | 'hybrid';

// Type pour le statut de téléchargement de modèle
export interface ModelDownloadStatus {
  status: 'idle' | 'downloading' | 'completed' | 'error';
  model: string | null;
  progress: number;
  started_at: number | null;
  completed_at: number | null;
  error: string | null;
  size_mb: number;
  downloaded_mb: number;
}

// Type pour la capacité du système
export interface SystemCapabilities {
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}

// Type pour la compatibilité du navigateur
export interface BrowserCompatibility {
  compatible: boolean;
  issues: string[];
}

// Type pour la requête de téléchargement de modèle
export interface ModelDownloadRequest {
  model: string;
  consent: boolean;
}

// Type pour la réponse de téléchargement de modèle
export interface ModelDownloadResponse {
  status: string;
  model: string;
  progress: number;
  estimated_size_mb: number;
}
