
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, MessagesSquare, DollarSign } from 'lucide-react';
import { formatNumber } from './utils';

export interface UsageSummaryCardsProps {
  totalTokensInput: number;
  totalTokensOutput: number;
  estimatedCost: number;
  isLoading?: boolean;
}

export const UsageSummaryCards = ({ 
  totalTokensInput, 
  totalTokensOutput, 
  estimatedCost,
  isLoading = false 
}: UsageSummaryCardsProps) => {
  const totalTokens = totalTokensInput + totalTokensOutput;
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            Tokens Totaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalTokens)}</div>
          <div className="text-xs text-muted-foreground">
            Entrée: {formatNumber(totalTokensInput)} / Sortie: {formatNumber(totalTokensOutput)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessagesSquare className="h-4 w-4 text-muted-foreground" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-muted-foreground">
            Cette information n'est pas disponible
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Coût Estimé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedCost.toFixed(2)} $</div>
          <div className="text-xs text-muted-foreground">
            Basé sur les tarifs standard des fournisseurs
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
