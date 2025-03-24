
import React from '@/core/reactInstance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModelUsage } from "./types";
import { formatNumber, formatDate, getTotalCost } from "./utils";

interface UsageTableProps {
  modelUsage: ModelUsage[];
}

export const UsageTable: React.FC<UsageTableProps> = ({ modelUsage }) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modèle</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Coût Est. ($)</TableHead>
            <TableHead className="hidden md:table-cell">Dernière utilisation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modelUsage.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.model}</TableCell>
              <TableCell>{item.provider}</TableCell>
              <TableCell className="text-right">{formatNumber(item.tokens_used)}</TableCell>
              <TableCell className="text-right">
                {item.estimated_cost === 0 ? (
                  <span className="text-green-600">Gratuit</span>
                ) : (
                  `$${item.estimated_cost.toFixed(2)}`
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(item.last_used)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-right">
        <p className="text-sm text-muted-foreground">Coût total estimé: <span className="font-bold">${getTotalCost(modelUsage)}</span></p>
        <p className="text-xs text-muted-foreground mt-1">
          Les modèles locaux fonctionnent sans coûts par requête
        </p>
      </div>
    </>
  );
};
