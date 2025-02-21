
export interface EmbeddingOptimizationConfig {
  batchSize: number;
  cacheEnabled: boolean;
  compressionEnabled: boolean;
  maxConcurrentRequests: number;
}

export interface SearchOptimizationConfig {
  usePrecomputed: boolean;
  maxResults: number;
  resultsCaching: boolean;
  cacheDuration: number;
}
