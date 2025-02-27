
import { Json } from './database';

export type ServiceType = 'openai' | 'perplexity' | 'deepseek' | 'anthropic' | 'local' | 'rag';

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
