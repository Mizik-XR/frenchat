
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, folderId, batchSize = 100 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Création d'un nouvel enregistrement de progression
    const { data: progress, error: progressError } = await supabase
      .from('indexing_progress')
      .insert({
        user_id: userId,
        current_folder: folderId,
        parent_folder: folderId,
        status: 'running',
        depth: 0,
        processed_files: 0,
        total_files: 0
      })
      .select()
      .single();

    if (progressError) {
      throw new Error('Erreur lors de l\'initialisation du suivi');
    }

    // Fonction récursive pour indexer les dossiers
    const indexFolderRecursively = async (folderId: string, depth: number) => {
      console.log(`Indexation du dossier ${folderId} à la profondeur ${depth}`);

      try {
        // Récupérer le token OAuth
        const { data: tokenData } = await supabase
          .from('oauth_tokens')
          .select('access_token')
          .eq('user_id', userId)
          .eq('provider', 'google')
          .single();

        if (!tokenData?.access_token) {
          throw new Error('Token OAuth non trouvé');
        }

        let pageToken: string | undefined = undefined;
        do {
          // Récupérer les fichiers et dossiers par lots
          const query = `'${folderId}' in parents and trashed = false`;
          const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,parents,size)&pageSize=${batchSize}${pageToken ? `&pageToken=${pageToken}` : ''}`;

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Erreur API Google Drive: ${response.statusText}`);
          }

          const data = await response.json();
          const files: GoogleDriveFile[] = data.files;
          pageToken = data.nextPageToken;

          // Mettre à jour le nombre total de fichiers
          await supabase
            .from('indexing_progress')
            .update({ 
              total_files: progress.total_files + files.length
            })
            .eq('id', progress.id);

          // Traiter les fichiers du lot actuel
          for (const file of files) {
            try {
              if (file.mimeType === 'application/vnd.google-apps.folder') {
                // Récursivement indexer les sous-dossiers
                await indexFolderRecursively(file.id, depth + 1);
              } else {
                // Indexer le fichier
                await supabase
                  .from('indexed_documents')
                  .insert({
                    user_id: userId,
                    provider_type: 'google_drive',
                    external_id: file.id,
                    title: file.name,
                    mime_type: file.mimeType,
                    file_size: file.size,
                    parent_folder_id: folderId,
                    file_path: file.name,
                    status: 'pending'
                  });

                // Mettre à jour la progression
                await supabase
                  .from('indexing_progress')
                  .update({ 
                    processed_files: progress.processed_files + 1,
                    last_processed_file: file.name 
                  })
                  .eq('id', progress.id);
              }
            } catch (error) {
              console.error(`Erreur lors du traitement du fichier ${file.name}:`, error);
              // Continuer avec les autres fichiers même si un échoue
            }
          }
        } while (pageToken);

      } catch (error) {
        console.error(`Erreur lors de l'indexation du dossier ${folderId}:`, error);
        await supabase
          .from('indexing_progress')
          .update({ 
            status: 'error',
            error: error.message
          })
          .eq('id', progress.id);
        throw error;
      }
    };

    // Démarrer l'indexation récursive
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          await indexFolderRecursively(folderId, 0);
          // Marquer comme terminé une fois tout traité
          await supabase
            .from('indexing_progress')
            .update({ status: 'completed' })
            .eq('id', progress.id);
        } catch (error) {
          console.error('Erreur lors de l\'indexation:', error);
        }
      })()
    );

    return new Response(
      JSON.stringify({
        success: true,
        progressId: progress.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
