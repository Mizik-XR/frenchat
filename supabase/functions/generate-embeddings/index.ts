
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
    const { text, documentId, chunkIndex } = await req.json();
    console.log('Generating embeddings for document:', documentId, 'chunk:', chunkIndex);

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));
    
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });

    const embeddingArray = Array.from(response);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
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

    await supabase.from('performance_metrics').insert({
      operation: 'generate_embeddings',
      success: true,
      duration: Date.now(),
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ success: true, embedding: embeddingArray }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Embedding generation error:', error);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('performance_metrics').insert({
      operation: 'generate_embeddings',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
