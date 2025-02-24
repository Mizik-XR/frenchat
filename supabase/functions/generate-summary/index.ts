
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    console.log(`Processing document summary for document ID: ${documentId}`);

    // Vérification du token Hugging Face
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN is not configured');
      throw new Error('Configuration Hugging Face manquante');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupération du document
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('content, title')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Error fetching document:', docError);
      throw new Error('Document non trouvé');
    }

    console.log(`Document "${document.title}" retrieved, content length: ${document.content.length}`);

    // Initialisation du client Hugging Face
    const hf = new HfInference(hfToken);
    console.log('Hugging Face client initialized, starting summarization...');

    // Utilisation du modèle BART pour le résumé
    const response = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: document.content,
      parameters: {
        max_length: 300,
        min_length: 100,
        do_sample: false
      }
    });

    console.log('Summary generated successfully');

    // Sauvegarde du résumé dans les métadonnées
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({
        metadata: {
          summary: response.summary_text,
          model: 'facebook/bart-large-cnn',
          generated_at: new Date().toISOString(),
          type: 'huggingface_transformers'
        }
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document metadata:', updateError);
      throw new Error('Erreur lors de la sauvegarde du résumé');
    }

    console.log('Document metadata updated with summary');

    return new Response(
      JSON.stringify({ 
        summary: response.summary_text,
        title: document.title,
        model: 'facebook/bart-large-cnn'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-summary:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors de la génération du résumé' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
