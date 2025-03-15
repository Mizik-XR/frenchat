
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalChart } from './HistoricalChart';
import { UsageSummaryCards } from './UsageSummaryCards';
import { UsageTable } from './UsageTable';
import { OptimizationTips } from './OptimizationTips';
import { UserCreditPanel } from './UserCreditPanel';
import { useUserCreditUsage } from "@/hooks/user/useUserCreditUsage";
import { APP_STATE } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const AIUsageMetrics = () => {
  const { user } = useAuth();
  const { usageStats, isLoading, error, refreshUsageData } = useUserCreditUsage();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // En mode hors ligne, afficher des données simulées
  const isOfflineMode = APP_STATE.isOfflineMode || (error ? true : false);

  // Ne rien afficher sans session
  if (!user && !APP_STATE.isOfflineMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques d'utilisation de l'IA</CardTitle>
          <CardDescription>Connectez-vous pour voir vos statistiques d'utilisation</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métriques d'utilisation de l'IA</CardTitle>
          <CardDescription>
            {isOfflineMode 
              ? "Voici des statistiques simulées de l'utilisation de l'IA (Mode hors ligne ou erreur)" 
              : "Visualisation de votre consommation de ressources IA"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="optimization">Optimisation</TabsTrigger>
              <TabsTrigger value="credits">Crédits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 py-4">
              <UsageSummaryCards
                totalTokensInput={usageStats.totalTokensInput}
                totalTokensOutput={usageStats.totalTokensOutput}
                estimatedCost={usageStats.totalCostEstimated}
                isLoading={isLoading && !isOfflineMode}
              />
              
              <UsageTable 
                usageByProvider={usageStats.usageByProvider}
                isLoading={isLoading && !isOfflineMode}
              />
            </TabsContent>
            
            <TabsContent value="history" className="py-4">
              <HistoricalChart 
                usageData={usageStats.recentUsage}
                isLoading={isLoading && !isOfflineMode} 
              />
            </TabsContent>
            
            <TabsContent value="optimization" className="py-4">
              <OptimizationTips 
                usageStats={usageStats}
                isOfflineMode={isOfflineMode}
              />
            </TabsContent>
            
            <TabsContent value="credits" className="py-4">
              <UserCreditPanel 
                credits={1000}
                remainingQuota={5000}
                isLoading={isLoading}
                onAddCredits={() => alert("Cette fonctionnalité sera disponible prochainement")}
                onRefresh={refreshUsageData}
                isOfflineMode={isOfflineMode}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
