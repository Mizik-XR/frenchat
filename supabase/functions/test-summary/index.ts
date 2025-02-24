
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline } from "https://esm.sh/@huggingface/transformers@latest";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Initialiser le pipeline de résumé avec T5
    const summarizer = await pipeline('summarization', 't5-small');

    // Générer le résumé
    const summary = await summarizer(text, {
      max_length: 150,
      min_length: 40,
      do_sample: false
    });

    // Log pour le suivi
    console.log('Résumé généré avec succès:', summary);

    return new Response(
      JSON.stringify({ 
        summary: summary[0].summary_text,
        model: 't5-small'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erreur lors de la génération du résumé:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Voir les logs pour plus d\'informations'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
