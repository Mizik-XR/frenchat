
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, folderId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Créer une nouvelle entrée de progression
    const { data: progress, error: progressError } = await supabase
      .from('indexing_progress')
      .insert({
        user_id: userId,
        current_folder: folderId,
        status: 'running'
      })
      .select()
      .single()

    if (progressError) {
      throw new Error('Erreur lors de l\'initialisation du suivi')
    }

    // Démarrer l'indexation initiale
    const { error: indexError } = await supabase.functions.invoke('index-google-drive', {
      body: { 
        userId,
        folderId,
        progressId: progress.id
      }
    })

    if (indexError) {
      throw indexError
    }

    return new Response(
      JSON.stringify({
        success: true,
        progressId: progress.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
