
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, type, userId } = await req.json()
    console.log(`Generating ${type} with prompt: ${prompt}`)
    console.log(`For user: ${userId || 'Not authenticated'}`)
    
    // Vérifier les crédits si un userId est fourni
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        
        // Coût fixe pour la génération d'image
        const imageCost = 0.02; // $0.02 par image générée
        
        // Vérifier le solde
        const { data: creditData, error: creditError } = await supabase.functions.invoke('manage-user-credits', {
          body: { 
            action: 'check_balance',
            userId
          }
        });
        
        if (creditError) {
          throw new Error(`Erreur lors de la vérification des crédits: ${creditError.message}`);
        }
        
        if (creditData && creditData.credit_balance < imageCost) {
          throw new Error(`Crédit insuffisant pour générer une image. Coût: $${imageCost}, Solde: $${creditData.credit_balance.toFixed(2)}`);
        }
        
        console.log(`Crédit suffisant pour image. Coût: $${imageCost}, Solde: $${creditData.credit_balance.toFixed(2)}`);
      } catch (creditError) {
        console.error('Erreur lors de la vérification des crédits:', creditError);
        throw creditError; // Pour les images, on bloque si le crédit est insuffisant
      }
    }
    
    // Utilisation du token Hugging Face
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    let image;
    if (type === 'chart') {
      // Pour les graphiques, on utilise un modèle spécialisé pour les visualisations
      image = await hf.textToImage({
        inputs: `A professional ${prompt} chart or graph with clean design, data visualization`,
        model: 'black-forest-labs/FLUX.1-schnell',
        parameters: {
          negative_prompt: 'blurry, low quality, text, watermark',
        }
      })
    } else {
      // Pour les illustrations générales
      image = await hf.textToImage({
        inputs: prompt,
        model: 'black-forest-labs/FLUX.1-schnell',
        parameters: {
          negative_prompt: 'blurry, low quality, watermark',
        }
      })
    }

    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Enregistrer l'utilisation et déduire les crédits si userId est fourni
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        
        // Coût fixe pour la génération d'image
        const imageCost = 0.02; // $0.02 par image générée
        
        // Enregistrer l'utilisation (tokens fixés arbitrairement pour les images)
        await supabase
          .from('ai_usage_metrics')
          .insert({
            user_id: userId,
            provider: 'huggingface-image',
            tokens_input: 100, // Valeur arbitraire pour les images
            tokens_output: 1000, // Valeur arbitraire pour les images
            estimated_cost: imageCost,
            from_cache: false,
            operation_type: 'image-generation'
          });
        
        // Déduire le coût des crédits
        await supabase.functions.invoke('manage-user-credits', {
          body: { 
            action: 'use_credits',
            userId,
            amount: imageCost
          }
        });
        
        console.log(`Utilisation d'image enregistrée: $${imageCost}`);
      } catch (usageError) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisation d\'image:', usageError);
        // Ne pas bloquer l'opération en cas d'erreur
      }
    }
    
    console.log(`${type} generated successfully`)
    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
