
export type AIServiceType = 'local' | 'cloud' | 'hybrid';

export interface TextGenerationParameters {
  model?: string;
  inputs?: string;
  prompt?: string;
  max_length?: number;
  temperature?: number;
  top_p?: number;
  system_prompt?: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
  };
}

export interface TextGenerationResponse {
  generated_text: string;
}

export interface OllamaGenerationResponse {
  model: string;
  response: string;
  created_at: string;
  done: boolean;
}

export interface RequestAnalysisResult {
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
  recommendedExecution: 'local' | 'cloud';
}

export interface SystemCapabilities {
  memoryScore: number;
  cpuScore: number;
  gpuAvailable: boolean;
  recommendLocalExecution: boolean;
}
