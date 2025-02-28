
export interface ModelUsage {
  model: string;
  provider: string;
  tokens_used: number;
  estimated_cost: number;
  last_used: string;
}

export interface HistoricalUsage {
  date: string;
  tokens: number;
  cost: number;
}
