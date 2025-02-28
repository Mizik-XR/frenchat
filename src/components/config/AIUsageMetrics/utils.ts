
import { ModelUsage, HistoricalUsage } from "./types";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (num: number) => {
  return num.toLocaleString('fr-FR');
};

export const getTotalCost = (modelUsage: ModelUsage[]) => {
  return modelUsage.reduce((total, item) => total + item.estimated_cost, 0).toFixed(2);
};

export const getTotalTokens = (modelUsage: ModelUsage[]) => {
  return modelUsage.reduce((total, item) => total + item.tokens_used, 0);
};

export const getMonthlyEstimate = (historicalUsage: HistoricalUsage[]) => {
  const dailyAverage = historicalUsage.reduce((acc, day) => acc + day.cost, 0) / historicalUsage.length;
  return (dailyAverage * 30).toFixed(2);
};
