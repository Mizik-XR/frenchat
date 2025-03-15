
export interface IndexingProgressState {
  progress: number;
  isIndexing: boolean;
  indexed: number;
  total: number;
  error: string | null;
  lastUpdate: number;
}
