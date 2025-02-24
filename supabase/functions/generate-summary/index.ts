
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer le contenu du document
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('content, title')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document non trouvé');
    }

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));

    // Utiliser le modèle BART fine-tuné pour le résumé
    const response = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: document.content,
      parameters: {
        max_length: 300,
        min_length: 100,
        do_sample: false
      }
    });

    const summary = response.summary_text;

    // Sauvegarder le résumé dans les métadonnées du document
    await supabaseClient
      .from('documents')
      .update({
        metadata: {
          summary,
          model: 'facebook/bart-large-cnn',
          generated_at: new Date().toISOString(),
          type: 'huggingface_transformers'
        }
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({ 
        summary,
        title: document.title,
        model: 'facebook/bart-large-cnn'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
