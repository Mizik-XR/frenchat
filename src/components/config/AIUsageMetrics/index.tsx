
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelUsage, HistoricalUsage } from "./types";
import { UsageSummaryCards } from "./UsageSummaryCards";
import { UsageTable } from "./UsageTable";
import { HistoricalChart } from "./HistoricalChart";
import { OptimizationTips } from "./OptimizationTips";
import { generateMockModelUsage, generateMockHistoricalUsage } from "./mockData";

export const AIUsageMetrics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [historicalUsage, setHistoricalUsage] = useState<HistoricalUsage[]>([]);
  const [activeTab, setActiveTab] = useState('current');
  const [chartView, setChartView] = useState<'tokens' | 'cost'>('tokens');
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
        setModelUsage(generateMockModelUsage());
        setHistoricalUsage(generateMockHistoricalUsage());
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

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            Utilisation de l'IA et Coûts Estimés
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Estimations basées sur les tarifs actuels des fournisseurs. Les modèles locaux n'engendrent pas de coûts par requête.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Suivi des jetons (tokens) utilisés et estimation des coûts associés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Utilisation Actuelle</TabsTrigger>
              <TabsTrigger value="historical">Historique (30 jours)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <UsageSummaryCards 
                    modelUsage={modelUsage} 
                    historicalUsage={historicalUsage} 
                  />
                  <UsageTable modelUsage={modelUsage} />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="historical">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <HistoricalChart 
                  historicalUsage={historicalUsage}
                  chartView={chartView}
                  setChartView={setChartView}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Les données sont calculées à partir de l'utilisation réelle et des tarifs actuels des services d'IA.
            Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
          </p>
        </CardFooter>
      </Card>
      
      <OptimizationTips />
    </div>
  );
};

export default AIUsageMetrics;
