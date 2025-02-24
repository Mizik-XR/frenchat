
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IndexingProgress {
  id: string;
  user_id: string;
  total_files: number;
  processed_files: number;
  current_folder: string | null;
  status: 'running' | 'completed' | 'error';
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { folderId } = await req.json()
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer le token Google Drive
    const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1])
    if (!user) throw new Error('User not authenticated')

    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Google Drive token not found')
    }

    // Initialiser ou mettre à jour l'état de l'indexation
    const { data: progress, error: progressError } = await supabase
      .from('indexing_progress')
      .upsert({
        user_id: user.id,
        total_files: 0,
        processed_files: 0,
        current_folder: folderId,
        status: 'running'
      })
      .select()
      .single()

    if (progressError) throw progressError

    // Fonction récursive pour parcourir les dossiers
    async function processFolder(folderId: string, pageToken?: string): Promise<void> {
      try {
        const queryParams = new URLSearchParams({
          q: `'${folderId}' in parents`,
          pageSize: '100',
          fields: 'nextPageToken,files(id,name,mimeType)',
        })
        if (pageToken) {
          queryParams.append('pageToken', pageToken)
        }

        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?${queryParams}`,
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Google API error: ${response.statusText}`)
        }

        const data = await response.json()

        // Mettre à jour le comptage total
        const { error: updateError } = await supabase
          .from('indexing_progress')
          .update({
            total_files: progress.total_files + data.files.length,
            current_folder: folderId
          })
          .eq('user_id', user.id)

        if (updateError) throw updateError

        // Traiter chaque fichier/dossier
        for (const file of data.files) {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            // Récursivement traiter les sous-dossiers
            await processFolder(file.id)
          }

          // Incrémenter le compteur de fichiers traités
          const { error: incrementError } = await supabase
            .from('indexing_progress')
            .update({
              processed_files: progress.processed_files + 1,
            })
            .eq('user_id', user.id)

          if (incrementError) throw incrementError
        }

        // S'il y a une page suivante, continuer
        if (data.nextPageToken) {
          await processFolder(folderId, data.nextPageToken)
        }
      } catch (error) {
        console.error('Error processing folder:', error)
        await supabase
          .from('indexing_progress')
          .update({
            status: 'error',
            error: error.message
          })
          .eq('user_id', user.id)
        throw error
      }
    }

    // Démarrer le traitement
    await processFolder(folderId)

    // Marquer comme terminé
    await supabase
      .from('indexing_progress')
      .update({
        status: 'completed'
      })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
