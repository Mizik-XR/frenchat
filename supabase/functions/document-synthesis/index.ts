
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sourceDocuments, outputFormat, destination } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupération du contenu des documents sources
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('content, metadata')
      .in('id', sourceDocuments);

    if (docsError) throw docsError;

    // Construction du contexte pour l'IA
    const context = documents.map(doc => doc.content).join('\n\n');

    // Appel à l'API de l'IA
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Vous êtes un assistant spécialisé dans l'analyse et la synthèse de documents. 
            Format de sortie demandé: ${outputFormat}`
          },
          {
            role: 'user',
            content: `Contexte des documents:\n${context}\n\nRequête: ${query}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    // Si une destination est spécifiée, sauvegarder le document
    if (destination === 'google_drive' || destination === 'microsoft_teams') {
      // Appel à l'API correspondante pour sauvegarder le document
      const uploadResponse = await fetch(
        destination === 'google_drive' 
          ? 'https://www.googleapis.com/upload/drive/v3/files'
          : 'https://graph.microsoft.com/v1.0/me/drive/root/children',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get(
              destination === 'google_drive' 
                ? 'GOOGLE_ACCESS_TOKEN' 
                : 'MICROSOFT_ACCESS_TOKEN'
            )}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Generated Document - ${new Date().toISOString()}`,
            content: generatedContent,
          }),
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload error: ${uploadResponse.statusText}`);
      }
    }

    return new Response(
      JSON.stringify({
        content: generatedContent,
        format: outputFormat,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
