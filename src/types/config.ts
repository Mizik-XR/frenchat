
import { Json } from './database';

export type ServiceType = 
  | 'openai' 
  | 'perplexity' 
  | 'deepseek' 
  | 'anthropic' 
  | 'local' 
  | 'rag'
  | 'llm'
  | 'stable_diffusion'
  | 'microsoft_teams';

export type LLMProvider =
  | 'openai'
  | 'huggingface'
  | 'anthropic'
  | 'perplexity'
  | 'deepseek'
  | 'local'
  | 'cohere'
  | 'mistral'
  | 'ollama';

export interface AIConfig {
  provider: ServiceType;
  apiKey?: string;
  model?: string;
  modelPath?: string;
  type?: string;
  config?: Record<string, any>;
}

export interface RagConfig {
  chunkSize: number;
  overlapSize: number;
  useSemanticStructure: boolean;
  respectStructure: boolean;
  embeddingModel: string;
  normalizeVectors: boolean;
  useHybridSearch: boolean;
  useQueryClassification: boolean;
  enhanceWithMetadata: boolean;
  minSimilarityThreshold: number;
  maxResults: number;
  reranking: boolean;
  useLocalCache: boolean;
  usePersistentCache: boolean;
  cacheTTL: number;
  compressionEnabled: boolean;
}

export interface GoogleConfig {
  clientId: string;
  apiKey: string;
  userId?: string;  // Rendu optionnel pour résoudre les erreurs
}

export interface IndexingProgress {
  total: number;
  processed: number;
  created_at: string;
  current_folder: string | null;
  depth: number | null;
  error: string | null;
  id: string;
  last_processed_file: string | null;
  parent_folder: string | null;
  processed_files: number | null;
  status: string;
  total_files: number | null;
  updated_at: string;
  user_id: string;
}

export interface ServiceCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  config?: Record<string, any>;
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  configuration?: Record<string, any>;
  rateLimit?: number;  // Ajouté pour résoudre l'erreur dans les tests
}

export interface EmbeddingCacheItem {
  text: string;
  embedding: number[];
  model: string;
  metadata?: Record<string, any>;
}

// Modifié pour éviter l'erreur d'interface avec Json
export interface CacheConfig {
  embedding?: number[];
  text?: string;
  model?: string;
}
