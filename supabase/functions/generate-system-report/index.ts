
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Vérification de l'authentification
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authentification requise' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Session invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Génération de rapport système demandé par l'utilisateur ${userData.user.id}`);

    // Période d'analyse (10 dernières minutes)
    const startTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Récupération des métriques
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', startTime);

    if (metricsError) throw metricsError;

    // Calcul des statistiques
    const totalOps = metrics?.length || 0;
    const successfulOps = metrics?.filter(m => m.success).length || 0;
    const successRate = totalOps > 0 ? (successfulOps / totalOps) * 100 : 100;
    const avgDuration = totalOps > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / totalOps 
      : 0;

    // Récupération des erreurs récentes
    const recentErrors = metrics
      ?.filter(m => !m.success)
      .map(m => ({
        operation: m.operation,
        error: m.error || 'Unknown error',
        timestamp: m.timestamp
      })) || [];

    // Statistiques de cache
    const cacheHits = metrics?.filter(m => m.cache_hit).length || 0;
    const hitRate = totalOps > 0 ? (cacheHits / totalOps) * 100 : 0;

    const report: SystemReport = {
      timestamp: new Date().toISOString(),
      metrics_summary: {
        total_operations: totalOps,
        success_rate: successRate,
        avg_duration: avgDuration,
        error_count: recentErrors.length
      },
      recent_errors: recentErrors,
      cache_stats: {
        hit_rate: hitRate,
        miss_rate: 100 - hitRate
      }
    };

    // Sauvegarder le rapport dans la base de données
    const { error: saveError } = await supabaseClient
      .from('system_reports')
      .insert([report]);

    if (saveError) throw saveError;

    // Vérifier les seuils d'alerte
    if (successRate < 95 || avgDuration > 1000 || recentErrors.length > 5) {
      console.error('Alert - System performance issues detected:', {
        successRate,
        avgDuration,
        errorCount: recentErrors.length
      });
    }

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating system report:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la génération du rapport' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
