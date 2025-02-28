
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ModelUsage {
  model: string;
  provider: string;
  tokens_used: number;
  estimated_cost: number;
  last_used: string;
}

export const AIUsageMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsageMetrics();
  }, []);

  const fetchUsageMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Récupération des données d'utilisation depuis Supabase
      // Dans un cas réel, utilisez une table dédiée pour stocker ces informations
      // Pour cet exemple, nous simulons des données
      
      // Simulation d'un délai de chargement pour l'exemple
      setTimeout(() => {
        const mockData: ModelUsage[] = [
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
        
        setModelUsage(mockData);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques d\'utilisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'utilisation",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalCost = () => {
    return modelUsage.reduce((total, item) => total + item.estimated_cost, 0).toFixed(2);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          Utilisation de l'IA et Coûts Estimés
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoCircle className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Estimations basées sur les tarifs actuels des fournisseurs. Les modèles locaux n'engendrent pas de coûts par requête.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          Suivi des jetons (tokens) utilisés et estimation des coûts associés
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
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
              <p className="text-sm text-muted-foreground">Coût total estimé: <span className="font-bold">${getTotalCost()}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                Les modèles locaux fonctionnent sans coûts par requête
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
