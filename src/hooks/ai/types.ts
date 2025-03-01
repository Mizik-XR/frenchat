
export interface TextGenerationParameters {
  model: string;
  inputs: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
  };
  system_prompt?: string;
  max_length?: number;
  temperature?: number;
  top_p?: number;
  prompt?: string;
}

export interface TextGenerationResponse {
  generated_text: string;
}

export interface OllamaGenerationResponse {
  response: string;
  done: boolean;
}

export type AIServiceType = 'local' | 'cloud';
