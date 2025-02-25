
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SystemReport {
  id: string;
  timestamp: string;
  metrics_summary: {
    success_rate: number;
    avg_duration: number;
    error_count: number;
    total_operations: number;
  };
  cache_stats: {
    hit_rate: number;
    miss_rate: number;
  };
  recent_errors: Array<{
    message: string;
    timestamp: string;
  }>;
}

export const SystemReportChart = () => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['systemReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_reports')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24); // Dernières 24 heures

      if (error) throw error;
      return data as SystemReport[];
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des métriques...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Erreur lors du chargement des métriques système
        </AlertDescription>
      </Alert>
    );
  }

  if (!reports?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Aucune donnée</AlertTitle>
        <AlertDescription>
          Aucune métrique système n'est disponible pour le moment
        </AlertDescription>
      </Alert>
    );
  }

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Taux de succès et performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={reports}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => formatTime(label as string)}
              />
              <Line
                type="monotone"
                name="Taux de succès"
                dataKey="metrics_summary.success_rate"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                type="monotone"
                name="Durée moyenne (ms)"
                dataKey="metrics_summary.avg_duration"
                stroke="#82ca9d"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Erreurs récentes</h3>
        <div className="space-y-4">
          {reports[0]?.recent_errors.map((error, index) => (
            <Alert key={index} variant={error ? "destructive" : "default"}>
              <XCircle className="h-4 w-4" />
              <AlertTitle>
                {formatTime(error.timestamp)}
              </AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          ))}
          {!reports[0]?.recent_errors.length && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Aucune erreur</AlertTitle>
              <AlertDescription>
                Aucune erreur récente n'a été détectée
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
};
