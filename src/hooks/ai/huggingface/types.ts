
import { LLMProviderType } from '@/types/config';
import { AIServiceType, TextGenerationParameters, TextGenerationResponse, ModelDownloadStatus } from '../types';

export interface HuggingFaceHookState {
  isLoading: boolean;
  error: string | null;
  serviceType: AIServiceType;
  localAIUrl: string | null;
  localProvider: LLMProviderType;
  isHybridMode: boolean;
}

export interface HuggingFaceHookResult extends HuggingFaceHookState {
  textGeneration: (options: TextGenerationParameters) => Promise<TextGenerationResponse[]>;
  checkLocalService: (url: string) => Promise<{ available: boolean; error?: string }>;
  setLocalProviderConfig: (provider: LLMProviderType) => LLMProviderType;
  detectLocalServices: () => Promise<{ available: boolean; url: string }[]>;
  modelDownloadStatus: ModelDownloadStatus;
  downloadModel: (request: any) => Promise<any>;
  modelsAvailable: any[];
  enableHybridMode: () => void;
  disableHybridMode: () => void;
}
