
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { files } = await req.json()
    const userId = req.headers.get('x-user-id')

    if (!files || !files.length) {
      throw new Error('Aucun fichier fourni')
    }

    if (!userId) {
      throw new Error('User ID manquant')
    }

    console.log(`Traitement de ${files.length} fichiers pour l'utilisateur ${userId}`)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const processedFiles = []
    for (const file of files) {
      try {
        // Stockage du document
        const { data: doc, error: docError } = await supabaseAdmin
          .from('documents')
          .insert({
            title: file.name,
            content: file.content, // Le contenu extrait du fichier
            document_type: file.type,
            user_id: userId,
            metadata: {
              size: file.size,
              uploaded_at: new Date().toISOString(),
              method: 'one-shot',
            }
          })
          .select()
          .single()

        if (docError) throw docError

        // Génération des embeddings via l'Edge Function existante
        await supabaseAdmin.functions.invoke('generate-embeddings', {
          body: {
            documentId: doc.id,
            content: file.content,
            metadata: {
              title: file.name,
              type: file.type,
            }
          }
        })

        processedFiles.push(doc.id)
      } catch (fileError) {
        console.error(`Erreur lors du traitement du fichier ${file.name}:`, fileError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedFiles.length,
        message: `${processedFiles.length} fichiers traités avec succès` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans la fonction process-uploaded-files:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
