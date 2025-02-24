
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { truncateText, splitIntoChunks } from './utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, documentId, content } = await req.json()

    if (action === 'index') {
      // Découper le document en chunks
      const chunks = splitIntoChunks(content, 500) // 500 caractères par chunk

      // Générer les embeddings pour chaque chunk
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk)
        
        await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            content: chunk,
            embedding: embedding,
            metadata: {
              chunk_size: chunk.length,
              timestamp: new Date().toISOString()
            }
          })
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Document indexé avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'search') {
      const { query } = await req.json()
      const queryEmbedding = await generateEmbedding(query)

      const { data: results, error } = await supabase.rpc(
        'search_documents',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 10
        }
      )

      if (error) throw error

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Action non supportée' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function generateEmbedding(text: string) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: truncateText(text, 8000),
      model: 'text-embedding-ada-002'
    })
  })

  const { data } = await response.json()
  return data[0].embedding
}
