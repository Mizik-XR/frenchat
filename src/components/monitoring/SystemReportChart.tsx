
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MetricsSummary {
  total_operations: number;
  success_rate: number;
  avg_duration: number;
  error_count: number;
}

interface CacheStats {
  hit_rate: number;
  miss_rate: number;
}

interface RecentError {
  operation: string;
  error: string;
  timestamp: string;
}

interface SystemReport {
  id: string;
  timestamp: string;
  metrics_summary: MetricsSummary;
  cache_stats: CacheStats;
  recent_errors: RecentError[];
}

const validateSystemReport = (data: unknown): SystemReport[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item): item is SystemReport => {
    if (!item || typeof item !== 'object') return false;
    
    const report = item as any;
    return (
      typeof report.id === 'string' &&
      typeof report.timestamp === 'string' &&
      typeof report.metrics_summary === 'object' &&
      typeof report.metrics_summary.success_rate === 'number' &&
      typeof report.metrics_summary.avg_duration === 'number' &&
      typeof report.metrics_summary.error_count === 'number' &&
      typeof report.metrics_summary.total_operations === 'number' &&
      typeof report.cache_stats === 'object' &&
      typeof report.cache_stats.hit_rate === 'number' &&
      typeof report.cache_stats.miss_rate === 'number' &&
      Array.isArray(report.recent_errors)
    );
  });
};

export const SystemReportChart = () => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['systemReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_reports')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(24);

      if (error) throw error;
      return validateSystemReport(data);
    },
    refetchInterval: 60000
  });

  if (isLoading) {
    return <div className="animate-pulse p-4">Chargement des métriques...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des métriques système
        </AlertDescription>
      </Alert>
    );
  }

  const formattedData = reports?.map(report => ({
    time: new Date(report.timestamp).toLocaleTimeString(),
    successRate: report.metrics_summary.success_rate,
    avgDuration: report.metrics_summary.avg_duration,
    errorCount: report.metrics_summary.error_count,
    cacheHitRate: report.cache_stats.hit_rate
  })) ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-6" data-cy="success-rate-chart">
        <h3 className="text-lg font-semibold mb-4">Taux de succès et Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="successRate"
                stroke="#10b981"
                name="Taux de succès (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgDuration"
                stroke="#6366f1"
                name="Durée moyenne (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6" data-cy="cache-stats-chart">
        <h3 className="text-lg font-semibold mb-4">Cache et Erreurs</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cacheHitRate"
                stroke="#f59e0b"
                name="Taux de cache (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorCount"
                stroke="#ef4444"
                name="Nombre d'erreurs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
