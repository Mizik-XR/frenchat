
import { serve } from 'https://deno.fresh.dev/serve';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  cacheHit?: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { metrics } = await req.json();

    if (!Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ error: 'Les métriques doivent être un tableau' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insertion des métriques dans la base de données
    const { error } = await supabaseClient
      .from('performance_metrics')
      .insert(metrics.map((metric: PerformanceMetric) => ({
        timestamp: new Date(metric.timestamp).toISOString(),
        operation: metric.operation,
        duration: metric.duration,
        success: metric.success,
        cache_hit: metric.cacheHit,
        error: metric.error
      })));

    if (error) {
      console.error('Erreur lors de l\'enregistrement des métriques:', error);
      throw error;
    }

    // Vérification des seuils d'alerte
    const alerts = await checkAlertThresholds(supabaseClient, metrics);

    return new Response(
      JSON.stringify({ success: true, alerts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkAlertThresholds(supabaseClient: any, metrics: PerformanceMetric[]) {
  const alerts = [];

  // Vérification du taux d'erreur
  const errorRate = metrics.filter(m => !m.success).length / metrics.length;
  if (errorRate > 0.1) { // Plus de 10% d'erreurs
    alerts.push({
      type: 'error_rate',
      message: `Taux d'erreur élevé: ${(errorRate * 100).toFixed(1)}%`,
      severity: 'high'
    });
  }

  // Vérification des temps de réponse
  const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  if (avgDuration > 1000) { // Plus d'une seconde en moyenne
    alerts.push({
      type: 'response_time',
      message: `Temps de réponse moyen élevé: ${avgDuration.toFixed(0)}ms`,
      severity: 'medium'
    });
  }

  return alerts;
}
