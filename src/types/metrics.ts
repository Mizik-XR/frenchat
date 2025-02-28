
export interface AIUsageMetric {
  id?: string;
  user_id: string;
  model_name: string;
  provider: string;
  tokens_input: number;
  tokens_output: number;
  estimated_cost: number;
  operation_type: 'chat' | 'embedding' | 'indexing' | 'document-generation';
  created_at: string;
}

export interface TokenUsageSummary {
  model: string;
  provider: string;
  total_tokens: number;
  estimated_cost: number;
  last_used: string;
}

export interface CostEstimate {
  provider: string;
  model: string;
  tokens_per_dollar: number; // Nombre approximatif de tokens pour 1 dollar
  base_cost?: number; // Coût de base éventuel
}

// Exemples de taux approximatifs (à des fins d'illustration)
export const COST_RATES: CostEstimate[] = [
  { provider: 'OpenAI', model: 'gpt-4', tokens_per_dollar: 2500 },
  { provider: 'OpenAI', model: 'gpt-4-turbo', tokens_per_dollar: 3500 }, 
  { provider: 'OpenAI', model: 'gpt-3.5-turbo', tokens_per_dollar: 20000 },
  { provider: 'Anthropic', model: 'claude-3-opus', tokens_per_dollar: 2000 },
  { provider: 'Anthropic', model: 'claude-3-sonnet', tokens_per_dollar: 6000 },
  { provider: 'Anthropic', model: 'claude-3-haiku', tokens_per_dollar: 15000 },
  { provider: 'Local', model: '*', tokens_per_dollar: Infinity }, // Les modèles locaux n'ont pas de coût par requête
  { provider: 'Huggingface', model: '*', tokens_per_dollar: Infinity }, // Pour les modèles Huggingface auto-hébergés
];
