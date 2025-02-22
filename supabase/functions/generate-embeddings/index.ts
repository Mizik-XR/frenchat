
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const CHUNK_SIZE = 1000; // Taille optimale pour le traitement par lots
const MAX_RETRIES = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting embedding generation process...');
  
  try {
    const { documentId, content } = await req.json();
    
    if (!documentId || !content) {
      console.error('Missing required parameters:', { hasDocumentId: !!documentId, hasContent: !!content });
      throw new Error('Missing required parameters');
    }

    console.log(`Processing document ${documentId}, content length: ${content.length}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Diviser le contenu en chunks pour éviter les problèmes de mémoire
    const chunks = splitIntoChunks(content, CHUNK_SIZE);
    console.log(`Split content into ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let retries = 0;
      let success = false;

      while (!success && retries < MAX_RETRIES) {
        try {
          const embedding = await generateEmbedding(chunk);
          
          const { error } = await supabase
            .from('document_embeddings')
            .insert({
              document_id: documentId,
              content: chunk,
              chunk_index: i,
              embedding
            });

          if (error) {
            throw error;
          }

          console.log(`Successfully processed chunk ${i + 1}/${chunks.length}`);
          success = true;

        } catch (error) {
          retries++;
          console.error(`Error processing chunk ${i + 1}, attempt ${retries}:`, error);
          
          if (retries === MAX_RETRIES) {
            throw new Error(`Failed to process chunk after ${MAX_RETRIES} attempts`);
          }
          
          // Attente exponentielle entre les tentatives
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    }

    console.log('Embedding generation completed successfully');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Embeddings generated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in embedding generation:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function splitIntoChunks(text: string, size: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length > size) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      currentLength = word.length;
    } else {
      currentChunk.push(word);
      currentLength += word.length + 1; // +1 pour l'espace
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0];
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}
