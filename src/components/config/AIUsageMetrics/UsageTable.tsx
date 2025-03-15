
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatNumber } from './utils';

export interface UsageTableProps {
  usageByProvider: Record<string, {
    count: number;
    tokensInput: number;
    tokensOutput: number;
    costEstimated: number;
  }>;
  isLoading?: boolean;
}

export const UsageTable = ({ usageByProvider, isLoading = false }: UsageTableProps) => {
  // Get sorted providers by usage
  const providers = Object.entries(usageByProvider)
    .sort(([, a], [, b]) => b.tokensInput + b.tokensOutput - (a.tokensInput + a.tokensOutput));

  if (isLoading) {
    return (
      <div className="rounded-md border animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Modèle</TableHead>
              <TableHead>Total Tokens</TableHead>
              <TableHead>Coût Estimé</TableHead>
              <TableHead className="text-right">Requêtes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map(i => (
              <TableRow key={i}>
                <TableCell className="h-4 bg-muted rounded w-[160px]"></TableCell>
                <TableCell className="h-4 bg-muted rounded w-[100px]"></TableCell>
                <TableCell className="h-4 bg-muted rounded w-[100px]"></TableCell>
                <TableCell className="h-4 bg-muted rounded w-[80px]"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-muted-foreground">
        Aucune donnée d'utilisation disponible
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Modèle</TableHead>
            <TableHead>Total Tokens</TableHead>
            <TableHead>Coût Estimé</TableHead>
            <TableHead className="text-right">Requêtes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map(([provider, stats]) => {
            const totalTokens = stats.tokensInput + stats.tokensOutput;
            return (
              <TableRow key={provider}>
                <TableCell className="font-medium">
                  {provider || 'Inconnu'}
                </TableCell>
                <TableCell>
                  {formatNumber(totalTokens)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatNumber(stats.tokensInput)} entrée / {formatNumber(stats.tokensOutput)} sortie)
                  </span>
                </TableCell>
                <TableCell>{stats.costEstimated.toFixed(3)} $</TableCell>
                <TableCell className="text-right">{stats.count}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
