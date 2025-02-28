
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface ModelUsage {
  model: string;
  provider: string;
  tokens_used: number;
  estimated_cost: number;
  last_used: string;
}

interface HistoricalUsage {
  date: string;
  tokens: number;
  cost: number;
}

export const AIUsageMetrics = () => {
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
        
        // Données historiques fictives pour les 30 derniers jours
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
        
        setModelUsage(mockData);
        setHistoricalUsage(mockHistorical);
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

  const getTotalTokens = () => {
    return modelUsage.reduce((total, item) => total + item.tokens_used, 0);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  const getMonthlyEstimate = () => {
    const dailyAverage = historicalUsage.reduce((acc, day) => acc + day.cost, 0) / historicalUsage.length;
    return (dailyAverage * 30).toFixed(2);
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
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(getTotalTokens())}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Coût Total ($)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${getTotalCost()}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Estimation Mensuelle</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${getMonthlyEstimate()}</div>
                      </CardContent>
                    </Card>
                  </div>
                
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
            </TabsContent>
            
            <TabsContent value="historical">
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <>
                  <div className="flex justify-end mb-4 space-x-2">
                    <Button 
                      variant={chartView === 'tokens' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setChartView('tokens')}
                    >
                      Tokens
                    </Button>
                    <Button 
                      variant={chartView === 'cost' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setChartView('cost')}
                    >
                      Coûts
                    </Button>
                  </div>
                  
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={historicalUsage}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval={6}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip 
                          formatter={(value: number) => [
                            chartView === 'tokens' 
                              ? `${formatNumber(value)} tokens` 
                              : `$${value.toFixed(2)}`,
                            chartView === 'tokens' ? 'Tokens utilisés' : 'Coût estimé'
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey={chartView === 'tokens' ? 'tokens' : 'cost'} 
                          name={chartView === 'tokens' ? 'Tokens utilisés' : 'Coût estimé ($)'} 
                          fill={chartView === 'tokens' ? "#8884d8" : "#82ca9d"} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-muted-foreground">Tokens moyens par jour</h3>
                          <p className="text-2xl font-bold">
                            {formatNumber(Math.round(historicalUsage.reduce((sum, day) => sum + day.tokens, 0) / historicalUsage.length))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-muted-foreground">Coût moyen par jour</h3>
                          <p className="text-2xl font-bold">
                            ${(historicalUsage.reduce((sum, day) => sum + day.cost, 0) / historicalUsage.length).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recommandations d'optimisation</CardTitle>
          <CardDescription>
            Conseils pour réduire vos coûts d'utilisation d'IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            <li>Utilisez des modèles locaux pour les tâches fréquentes ou routinières</li>
            <li>Réduisez la longueur des prompts en étant plus concis</li>
            <li>Utilisez le chunking intelligent pour optimiser l'indexation des documents</li>
            <li>Limitez le nombre de tokens générés en paramétrant correctement vos requêtes</li>
            <li>Utilisez la mise en cache des requêtes similaires pour éviter les duplications</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
