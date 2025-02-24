
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type IndexingProgress = {
  id: string;
  user_id: string;
  total_files: number;
  processed_files: number;
  current_folder: string | null;
  parent_folder: string | null;
  depth: number;
  last_processed_file: string | null;
  status: 'running' | 'completed' | 'error';
  error: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folderId, userId, progressId, pageToken } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Google Drive token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('provider', 'google')
      .eq('user_id', userId)
      .single()

    if (tokenError || !tokenData?.access_token) {
      throw new Error('Token non trouvé')
    }

    // Fonction pour obtenir les fichiers d'un dossier avec pagination
    async function listFiles(currentFolderId: string, nextPageToken?: string) {
      const queryParams = new URLSearchParams({
        q: `'${currentFolderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
        pageSize: '100',
      })

      if (nextPageToken) {
        queryParams.append('pageToken', nextPageToken)
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
        throw new Error('Erreur lors de la récupération des fichiers')
      }

      return response.json()
    }

    // Fonction pour mettre à jour la progression
    async function updateProgress(data: Partial<IndexingProgress>) {
      const { error } = await supabase
        .from('indexing_progress')
        .update(data)
        .eq('id', progressId)

      if (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error)
      }
    }

    // Processus d'indexation
    try {
      const filesData = await listFiles(folderId, pageToken)
      
      // Mettre à jour la progression
      let folderCount = 0
      let fileCount = 0
      
      for (const file of filesData.files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          folderCount++
          
          // Enregistrer le dossier
          await supabase
            .from('google_drive_folders')
            .upsert({
              folder_id: file.id,
              parent_folder_id: folderId,
              name: file.name,
              user_id: userId,
              last_synced: new Date().toISOString(),
              metadata: {
                modifiedTime: file.modifiedTime
              }
            })
        } else {
          fileCount++
          
          // Indexer le fichier
          await supabase
            .from('uploaded_documents')
            .upsert({
              title: file.name,
              file_path: `gdrive/${file.id}`,
              file_type: file.mimeType,
              size: file.size || 0,
              user_id: userId,
              mime_type: file.mimeType,
              metadata: {
                google_file_id: file.id,
                modified_time: file.modifiedTime,
              }
            })
        }

        // Mettre à jour le dernier fichier traité
        await updateProgress({
          last_processed_file: file.name,
          processed_files: fileCount
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          nextPageToken: filesData.nextPageToken,
          stats: {
            folders: folderCount,
            files: fileCount
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (error) {
      await updateProgress({
        status: 'error',
        error: error.message
      })

      throw error
    }

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
