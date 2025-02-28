
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ModelUsage, HistoricalUsage } from "./types";
import { formatNumber, getTotalTokens, getTotalCost, getMonthlyEstimate } from "./utils";

interface UsageSummaryCardsProps {
  modelUsage: ModelUsage[];
  historicalUsage: HistoricalUsage[];
}

export const UsageSummaryCards: React.FC<UsageSummaryCardsProps> = ({ modelUsage, historicalUsage }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(getTotalTokens(modelUsage))}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Coût Total ($)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${getTotalCost(modelUsage)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Estimation Mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${getMonthlyEstimate(historicalUsage)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
