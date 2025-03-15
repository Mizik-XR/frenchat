
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Types pour la requête
interface UsageMetricsRequest {
  userId: string;
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase avec la clé de service
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Extraire les données de la requête
    const { userId, startDate, endDate } = await req.json() as UsageMetricsRequest;

    if (!userId) {
      throw new Error('Paramètre userId manquant');
    }

    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData.user) {
      throw new Error(`Utilisateur non trouvé: ${userError?.message || 'ID utilisateur invalide'}`);
    }

    // Construire la requête pour récupérer les métriques d'utilisation
    let query = supabaseAdmin
      .from('ai_usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Ajouter des filtres de date si spécifiés
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Exécuter la requête
    const { data: metrics, error: metricsError } = await query;

    if (metricsError) {
      throw new Error(`Erreur lors de la récupération des métriques: ${metricsError.message}`);
    }

    // Calculer les statistiques globales
    const totalTokensInput = metrics?.reduce((sum, metric) => sum + (metric.tokens_input || 0), 0) || 0;
    const totalTokensOutput = metrics?.reduce((sum, metric) => sum + (metric.tokens_output || 0), 0) || 0;
    const totalCost = metrics?.reduce((sum, metric) => sum + (metric.estimated_cost || 0), 0) || 0;

    // Obtenir les métriques par fournisseur
    const providerMetrics: Record<string, any> = {};
    metrics?.forEach(metric => {
      const provider = metric.provider;
      if (!providerMetrics[provider]) {
        providerMetrics[provider] = {
          count: 0,
          tokens_input: 0,
          tokens_output: 0,
          estimated_cost: 0
        };
      }
      
      providerMetrics[provider].count += 1;
      providerMetrics[provider].tokens_input += metric.tokens_input || 0;
      providerMetrics[provider].tokens_output += metric.tokens_output || 0;
      providerMetrics[provider].estimated_cost += metric.estimated_cost || 0;
    });

    return new Response(
      JSON.stringify({
        success: true,
        metrics: metrics || [],
        summary: {
          totalTokensInput,
          totalTokensOutput,
          totalCost,
          providerMetrics
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Erreur:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Une erreur s\'est produite',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
