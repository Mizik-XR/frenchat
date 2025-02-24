
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Utiliser l'API Perplexity pour générer le résumé
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant spécialisé dans la création de résumés concis et structurés. Identifie les 5 points clés et crée un résumé en bullet points.'
          },
          {
            role: 'user',
            content: `Résume ce document de manière concise avec les points clés : ${document.content}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    const result = await response.json();
    const summary = result.choices[0].message.content;

    // Sauvegarder le résumé dans les métadonnées du document
    await supabaseClient
      .from('documents')
      .update({
        metadata: {
          summary,
          generated_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({ 
        summary,
        title: document.title 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
