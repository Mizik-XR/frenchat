
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { pipeline } from 'https://esm.sh/@huggingface/transformers@2.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  text: string;
  documentId: string;
  chunkIndex: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, documentId, chunkIndex } = await req.json() as RequestBody;

    // Initialiser le pipeline Sentence Transformers
    const extractor = await pipeline(
      'feature-extraction',
      'sentence-transformers/all-MiniLM-L6-v2',
      { revision: 'main' }
    );

    console.log('Generating embeddings for text:', text.substring(0, 100) + '...');

    // Générer les embeddings
    const embeddings = await extractor(text, {
      pooling: "mean",
      normalize: true
    });

    // Convertir le tenseur en array pour stockage
    const embeddingArray = Array.from(embeddings.data);

    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Stocker les embeddings dans la base de données
    const { data, error } = await supabaseClient
      .from('document_embeddings')
      .upsert({
        document_id: documentId,
        chunk_index: chunkIndex,
        content: text,
        embedding: embeddingArray,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Enregistrer la métrique de performance
    await supabaseClient
      .from('performance_metrics')
      .insert({
        operation: 'generate_embeddings',
        duration: Date.now(),
        success: true,
        timestamp: new Date().toISOString(),
        cache_hit: false
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        embedding: embeddingArray,
        message: 'Embeddings generated and stored successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);

    // Enregistrer l'erreur dans les métriques
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('performance_metrics')
      .insert({
        operation: 'generate_embeddings',
        duration: Date.now(),
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        cache_hit: false
      });

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la génération des embeddings',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
