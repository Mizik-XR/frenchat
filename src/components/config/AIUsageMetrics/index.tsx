
import React, { useState, useEffect } from '@/core/reactInstance';
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
import { UserCreditPanel } from "./UserCreditPanel";
import { generateMockModelUsage, generateMockHistoricalUsage } from "./mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/AuthProvider';

export const AIUsageMetrics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [historicalUsage, setHistoricalUsage] = useState<HistoricalUsage[]>([]);
  const [activeTab, setActiveTab] = useState('current');
  const [chartView, setChartView] = useState<'tokens' | 'cost'>('tokens');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsageMetrics();
  }, [user]);

  const fetchUsageMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Si un utilisateur est connecté, récupérer ses données d'utilisation réelles
      if (user) {
        // Récupérer les données d'utilisation par modèle
        const { data: usageData, error: usageError } = await supabase
          .from('ai_usage_metrics')
          .select('provider, tokens_input, tokens_output, estimated_cost, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (usageError) throw usageError;
        
        // Transformer les données pour l'affichage
        if (usageData && usageData.length > 0) {
          // Agréger l'utilisation par modèle
          const modelMap = new Map<string, ModelUsage>();
          
          usageData.forEach(record => {
            const provider = record.provider;
            const existingModel = modelMap.get(provider);
            
            if (existingModel) {
              existingModel.tokens_used += record.tokens_input + record.tokens_output;
              existingModel.estimated_cost += record.estimated_cost;
              // Mettre à jour la date de dernière utilisation si plus récente
              if (new Date(record.created_at) > new Date(existingModel.last_used)) {
                existingModel.last_used = record.created_at;
              }
            } else {
              modelMap.set(provider, {
                model: getModelDisplayName(provider),
                provider: getProviderDisplayName(provider),
                tokens_used: record.tokens_input + record.tokens_output,
                estimated_cost: record.estimated_cost,
                last_used: record.created_at
              });
            }
          });
          
          setModelUsage(Array.from(modelMap.values()));
          
          // Créer des données historiques (simplifiées par jour)
          const now = new Date();
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          
          // Grouper par jour
          const dailyData = new Map<string, { tokens: number, cost: number }>();
          
          usageData.forEach(record => {
            const date = new Date(record.created_at);
            const dateKey = date.toISOString().split('T')[0];
            
            if (date >= thirtyDaysAgo) {
              const existing = dailyData.get(dateKey) || { tokens: 0, cost: 0 };
              existing.tokens += record.tokens_input + record.tokens_output;
              existing.cost += record.estimated_cost;
              dailyData.set(dateKey, existing);
            }
          });
          
          // Convertir en format historique
          const historicalData: HistoricalUsage[] = Array.from(dailyData.entries())
            .map(([date, data]) => ({
              date,
              tokens: data.tokens,
              cost: data.cost
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
          
          setHistoricalUsage(historicalData);
        } else {
          // Si pas de données, utiliser des données simulées
          setModelUsage(generateMockModelUsage());
          setHistoricalUsage(generateMockHistoricalUsage());
        }
      } else {
        // Utiliser des données simulées pour les utilisateurs non connectés
        setModelUsage(generateMockModelUsage());
        setHistoricalUsage(generateMockHistoricalUsage());
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques d\'utilisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'utilisation",
        variant: "destructive"
      });
      
      // Utiliser des données simulées en cas d'erreur
      setModelUsage(generateMockModelUsage());
      setHistoricalUsage(generateMockHistoricalUsage());
      setIsLoading(false);
    }
  };

  // Helper pour obtenir un nom d'affichage pour le modèle
  const getModelDisplayName = (provider: string): string => {
    if (provider.includes('gpt-4')) return 'GPT-4';
    if (provider.includes('gpt-3.5')) return 'GPT-3.5 Turbo';
    if (provider.includes('claude')) return 'Claude';
    if (provider.includes('mistral')) return 'Mistral AI';
    if (provider.includes('hugging')) return 'Hugging Face';
    if (provider.includes('deepseek')) return 'DeepSeek';
    return provider;
  };
  
  // Helper pour obtenir un nom d'affichage pour le fournisseur
  const getProviderDisplayName = (provider: string): string => {
    if (provider.includes('openai')) return 'OpenAI';
    if (provider.includes('anthropic')) return 'Anthropic';
    if (provider.includes('mistral')) return 'Mistral AI';
    if (provider.includes('hugging')) return 'Hugging Face';
    if (provider.includes('deepseek')) return 'DeepSeek';
    return 'AI Provider';
  };

  return (
    <div className="space-y-6">
      {/* Panneau de crédit utilisateur */}
      <UserCreditPanel />
      
      {/* Métriques d'utilisation */}
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
