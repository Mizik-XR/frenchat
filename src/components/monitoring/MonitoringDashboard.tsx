
import React, { useState, useEffect } from '@/core/reactInstance';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemReportChart } from './SystemReportChart';
import { secureApiRequest } from '@/services/apiConfig';
import { toast } from '@/hooks/use-toast';

interface SystemReport {
  timestamp: string;
  metrics_summary: {
    total_operations: number;
    success_rate: number;
    avg_duration: number;
    error_count: number;
  };
  recent_errors: Array<{
    operation: string;
    error: string;
    timestamp: string;
  }>;
  cache_stats: {
    hit_rate: number;
    miss_rate: number;
  };
}

export const MonitoringDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: systemReport, isLoading, error, refetch } = useQuery<SystemReport>({
    queryKey: ['systemReport'],
    queryFn: async () => {
      try {
        return await secureApiRequest('/generate-system-report');
      } catch (error) {
        console.error('Failed to fetch system report:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de monitoring",
        variant: "destructive",
      });
    }
  }, [error]);

  const getStatusColor = (successRate: number) => {
    if (successRate >= 98) return "bg-green-100 text-green-800";
    if (successRate >= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monitoring Système</h1>
        <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {systemReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">{systemReport.metrics_summary.success_rate.toFixed(2)}%</div>
                  <Badge 
                    className={`w-fit mt-1 ${getStatusColor(systemReport.metrics_summary.success_rate)}`}
                  >
                    {systemReport.metrics_summary.success_rate >= 98 ? 'Excellent' : 
                     systemReport.metrics_summary.success_rate >= 90 ? 'Bon' : 'Problématique'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Opérations totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemReport.metrics_summary.total_operations}</div>
                <p className="text-xs text-gray-500 mt-1">Dernières 10 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Temps moyen de réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemReport.metrics_summary.avg_duration.toFixed(0)} ms</div>
                <Badge 
                  className={`w-fit mt-1 ${
                    systemReport.metrics_summary.avg_duration < 500 ? 'bg-green-100 text-green-800' :
                    systemReport.metrics_summary.avg_duration < 1000 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {systemReport.metrics_summary.avg_duration < 500 ? 'Rapide' : 
                   systemReport.metrics_summary.avg_duration < 1000 ? 'Acceptable' : 'Lent'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux d'utilisation du cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemReport.cache_stats.hit_rate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 mt-1">Efficacité du système de cache</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="errors">Erreurs récentes</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>État du système</CardTitle>
                  <CardDescription>
                    Dernière mise à jour: {formatDate(systemReport.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemReport.metrics_summary.error_count > 0 && (
                    <Alert className="mb-4 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Attention</AlertTitle>
                      <AlertDescription>
                        {systemReport.metrics_summary.error_count} erreurs détectées récemment
                      </AlertDescription>
                    </Alert>
                  )}

                  {systemReport.metrics_summary.success_rate < 95 && (
                    <Alert className="mb-4 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Alerte</AlertTitle>
                      <AlertDescription>
                        Taux de succès des opérations sous le seuil acceptable ({systemReport.metrics_summary.success_rate.toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  )}

                  {systemReport.metrics_summary.error_count === 0 && systemReport.metrics_summary.success_rate >= 95 && (
                    <Alert className="mb-4 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Tout est normal</AlertTitle>
                      <AlertDescription>
                        Tous les systèmes fonctionnent correctement
                      </AlertDescription>
                    </Alert>
                  )}

                  <SystemReportChart report={systemReport} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Erreurs récentes</CardTitle>
                  <CardDescription>
                    Liste des {systemReport.recent_errors.length} dernières erreurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemReport.recent_errors.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p>Aucune erreur récente détectée</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {systemReport.recent_errors.map((error, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-red-50">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{error.operation}</div>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(error.timestamp)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{error.error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métriques de performance</CardTitle>
                  <CardDescription>
                    Analyse détaillée des performances du système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Cache</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-600 h-4 rounded-full" 
                            style={{ width: `${systemReport.cache_stats.hit_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {systemReport.cache_stats.hit_rate.toFixed(1)}% utilisé
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Temps de réponse moyen</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full ${
                              systemReport.metrics_summary.avg_duration < 500 ? 'bg-green-500' :
                              systemReport.metrics_summary.avg_duration < 1000 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, systemReport.metrics_summary.avg_duration / 20)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {systemReport.metrics_summary.avg_duration.toFixed(0)} ms
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les données de monitoring. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
