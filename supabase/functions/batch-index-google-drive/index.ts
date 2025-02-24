
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { google } from "https://deno.land/x/google_auth@v0.8.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IndexingProgress {
  totalFiles: number;
  processedFiles: number;
  currentFolder: string;
  status: 'running' | 'completed' | 'error';
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { folderId, pageToken, userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer le token d'accès Google Drive
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Token Google Drive non trouvé');
    }

    // Initialiser le client Google Drive
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: tokenData.access_token });
    const drive = google.drive({ version: 'v3', auth });

    // Mettre à jour la progression
    const updateProgress = async (progress: Partial<IndexingProgress>) => {
      await supabase
        .from('indexing_progress')
        .upsert({ 
          user_id: userId,
          ...progress,
          updated_at: new Date().toISOString()
        });
    };

    // Fonction pour traiter un lot de fichiers
    const processFiles = async (folderIds: string[], pageToken?: string) => {
      const results = await drive.files.list({
        q: `'${folderIds[0]}' in parents and trashed = false`,
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime)',
        pageToken: pageToken
      });

      const files = results.data.files || [];
      
      // Indexer les fichiers trouvés
      for (const file of files) {
        try {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            folderIds.push(file.id);
          }

          await supabase.from('documents').upsert({
            external_id: file.id,
            title: file.name,
            document_type: 'google_drive',
            metadata: {
              mime_type: file.mimeType,
              created_time: file.createdTime,
              modified_time: file.modifiedTime
            },
            user_id: userId
          });

          // Mettre à jour la progression
          await updateProgress({
            processedFiles: files.indexOf(file) + 1,
            currentFolder: folderIds[0],
            status: 'running'
          });

        } catch (error) {
          console.error(`Erreur lors de l'indexation du fichier ${file.name}:`, error);
        }
      }

      return {
        nextPageToken: results.data.nextPageToken,
        newFolders: folderIds.slice(1)
      };
    };

    // Commencer ou continuer l'indexation
    const result = await processFiles([folderId], pageToken);

    return new Response(
      JSON.stringify(result),
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
