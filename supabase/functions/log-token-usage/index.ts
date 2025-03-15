
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Types pour la requête
interface TokenUsageRequest {
  userId: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  fromCache: boolean;
  operationType?: string;
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
    const { userId, provider, inputTokens, outputTokens, fromCache, operationType = 'chat' } = await req.json() as TokenUsageRequest;

    if (!userId || !provider) {
      throw new Error('Paramètres manquants: userId et provider sont requis');
    }

    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData.user) {
      throw new Error(`Utilisateur non trouvé: ${userError?.message || 'ID utilisateur invalide'}`);
    }

    // Calculer le coût estimé basé sur le fournisseur
    let costPerToken = 0.00001; // Coût par défaut par token en USD
    if (provider.includes('gpt-4')) {
      costPerToken = 0.00003;
    } else if (provider.includes('gpt-3')) {
      costPerToken = 0.000005;
    } else if (provider.includes('claude')) {
      costPerToken = 0.00002;
    } else if (provider.includes('mistral')) {
      costPerToken = 0.000007;
    } else if (provider.includes('huggingface') || provider.includes('hf')) {
      costPerToken = 0.000002;
    }

    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = fromCache ? 0 : totalTokens * costPerToken;

    // Enregistrer l'utilisation dans la base de données
    const { error: insertError } = await supabaseAdmin
      .from('ai_usage_metrics')
      .insert({
        user_id: userId,
        provider,
        tokens_input: inputTokens,
        tokens_output: outputTokens,
        estimated_cost: estimatedCost,
        from_cache: fromCache,
        operation_type: operationType
      });

    if (insertError) {
      throw new Error(`Erreur lors de l'enregistrement de l'utilisation: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Utilisation enregistrée avec succès',
        data: {
          userId,
          provider,
          inputTokens,
          outputTokens,
          estimatedCost,
          fromCache,
          operationType
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
