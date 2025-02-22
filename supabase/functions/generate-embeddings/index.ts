
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CHUNK_SIZE = 500
const MAX_TOKENS = 2000

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId, content, metadata } = await req.json()
    console.log(`Démarrage de la génération d'embeddings pour le document ${documentId}`)

    if (!documentId || !content) {
      throw new Error('Document ID et contenu requis')
    }

    // Initialisation du client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialisation de Hugging Face
    const hf = new HfInference(Deno.env.get('HUGGINGFACE_API_KEY'))

    // Découpage du contenu en chunks
    const chunks = splitIntoChunks(content, CHUNK_SIZE)
    console.log(`Document découpé en ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Traitement du chunk ${i + 1}/${chunks.length}`)

      try {
        // Génération de l'embedding
        const embeddingResponse = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: chunk,
        })

        if (!Array.isArray(embeddingResponse)) {
          throw new Error('Format d\'embedding invalide')
        }

        // Stockage de l'embedding
        const { error: insertError } = await supabaseAdmin
          .from('document_embeddings')
          .upsert({
            document_id: documentId,
            chunk_index: i,
            content: chunk,
            embedding: embeddingResponse,
            metadata: {
              ...metadata,
              chunk_size: chunk.length,
              timestamp: new Date().toISOString(),
            }
          })

        if (insertError) {
          throw new Error(`Erreur lors du stockage de l'embedding: ${insertError.message}`)
        }

      } catch (chunkError) {
        console.error(`Erreur lors du traitement du chunk ${i}:`, chunkError)
        // Continue avec le prochain chunk même en cas d'erreur
      }
    }

    return new Response(
      JSON.stringify({ success: true, chunks_processed: chunks.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans la fonction generate-embeddings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentLength = 0

  for (const word of words) {
    if (currentLength + word.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
      currentChunk = []
      currentLength = 0
    }
    currentChunk.push(word)
    currentLength += word.length + 1 // +1 pour l'espace
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }

  return chunks
}
