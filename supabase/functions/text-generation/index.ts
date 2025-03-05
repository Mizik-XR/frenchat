
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_API_URL = "https://api-inference.huggingface.co/models";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model, inputs, parameters, userId } = await req.json();

    console.log(`Requête de génération de texte pour le modèle ${model}`);
    console.log(`Paramètres: ${JSON.stringify(parameters)}`);
    console.log(`Pour l'utilisateur: ${userId || 'Non authentifié'}`);

    // Vérifier les crédits de l'utilisateur si userId est fourni
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        
        // Estimer le coût potentiel (estimation approximative)
        const inputTokens = Math.ceil(inputs.length / 4); // Approximation grossière
        const maxTokens = parameters?.max_tokens || 500;
        const estimatedTokens = inputTokens + maxTokens;
        const estimatedCost = estimatedTokens * 0.000002; // $0.000002 par token pour HF
        
        // Vérifier le solde de l'utilisateur
        const { data: creditData, error: creditError } = await supabase.functions.invoke('manage-user-credits', {
          body: { 
            action: 'check_balance',
            userId
          }
        });
        
        if (creditError) {
          throw new Error(`Erreur lors de la vérification des crédits: ${creditError.message}`);
        }
        
        if (creditData && creditData.credit_balance < estimatedCost && estimatedCost > 0.001) {
          throw new Error(`Crédit insuffisant. Coût estimé: $${estimatedCost.toFixed(4)}, Solde: $${creditData.credit_balance.toFixed(2)}`);
        }
        
        console.log(`Crédit suffisant. Estimation: $${estimatedCost.toFixed(6)}, Solde: $${creditData.credit_balance.toFixed(2)}`);
      } catch (creditError) {
        console.error('Erreur lors de la vérification des crédits:', creditError);
        // Continuer même en cas d'erreur pour ne pas bloquer l'utilisateur pour une fonction non critique
      }
    }

    // Appel à l'API Hugging Face
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs,
        parameters
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Hugging Face response received successfully');

    // Enregistrer l'utilisation et déduire les crédits si userId est fourni
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        
        // Estimer les tokens utilisés
        const inputTokens = Math.ceil(inputs.length / 4);
        const outputText = Array.isArray(result) ? result[0]?.generated_text || '' : (result.results || '');
        const outputTokens = Math.ceil(outputText.length / 4);
        const totalTokens = inputTokens + outputTokens;
        
        // Coût approximatif pour Hugging Face
        const cost = totalTokens * 0.000002; // $0.000002 par token
        
        // Enregistrer l'utilisation
        await supabase
          .from('ai_usage_metrics')
          .insert({
            user_id: userId,
            provider: model.includes('/') ? model.split('/')[0] : 'huggingface',
            tokens_input: inputTokens,
            tokens_output: outputTokens,
            estimated_cost: cost,
            from_cache: false,
            operation_type: 'text-generation'
          });
        
        // Déduire le coût des crédits
        if (cost > 0) {
          await supabase.functions.invoke('manage-user-credits', {
            body: { 
              action: 'use_credits',
              userId,
              amount: cost
            }
          });
        }
        
        console.log(`Utilisation enregistrée: ${totalTokens} tokens, $${cost.toFixed(6)}`);
      } catch (usageError) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisation:', usageError);
        // Ne pas bloquer l'opération en cas d'erreur
      }
    }

    return new Response(
      JSON.stringify({ text: Array.isArray(result) ? result[0]?.generated_text : result.results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in text-generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
