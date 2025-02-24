
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline, Pipeline } from "https://esm.sh/@huggingface/transformers@latest";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let summarizer: Pipeline | null = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, maxLength = 150, minLength = 40 } = await req.json();

    if (!text) {
      throw new Error("Le texte à résumer est requis");
    }

    if (!summarizer) {
      console.log('Initialisation du modèle de résumé...');
      summarizer = await pipeline('summarization', 't5-small');
      console.log('Modèle chargé avec succès');
    }

    console.log('Génération du résumé pour un texte de', text.length, 'caractères');
    
    const summary = await summarizer(text, {
      max_length: maxLength,
      min_length: minLength,
      do_sample: false
    });

    console.log('Résumé généré avec succès');

    return new Response(
      JSON.stringify({ 
        summary: summary[0].summary_text,
        model: 't5-small',
        originalLength: text.length,
        summaryLength: summary[0].summary_text.length
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
