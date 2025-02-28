
import { ModelUsage, HistoricalUsage } from "./types";

export const generateMockModelUsage = (): ModelUsage[] => {
  return [
    { 
      model: 'gpt-4-turbo', 
      provider: 'OpenAI', 
      tokens_used: 15250, 
      estimated_cost: 0.46, 
      last_used: new Date(Date.now() - 1800000).toISOString() 
    },
    { 
      model: 'mistral-7b', 
      provider: 'Local', 
      tokens_used: 42800, 
      estimated_cost: 0, 
      last_used: new Date(Date.now() - 3600000).toISOString() 
    },
    { 
      model: 'claude-3-haiku', 
      provider: 'Anthropic', 
      tokens_used: 8700, 
      estimated_cost: 0.12, 
      last_used: new Date(Date.now() - 7200000).toISOString() 
    }
  ];
};

export const generateMockHistoricalUsage = (): HistoricalUsage[] => {
  const mockHistorical: HistoricalUsage[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    mockHistorical.push({
      date: date.toISOString().split('T')[0],
      tokens: Math.floor(Math.random() * 5000) + 500,
      cost: Number((Math.random() * 0.15).toFixed(2))
    });
  }
  return mockHistorical;
};
