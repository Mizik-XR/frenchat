
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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

interface IndexingOptions {
  userId: string;
  folderId: string;
  recursive?: boolean;
  maxDepth?: number;
  batchSize?: number;
  parentFolderId?: string;
  currentDepth?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      userId,
      folderId,
      recursive = true,
      maxDepth = 10,
      batchSize = 100,
      parentFolderId,
      currentDepth = 0
    } = await req.json() as IndexingOptions;

    console.log('Starting batch indexing with options:', {
      folderId,
      recursive,
      maxDepth,
      batchSize,
      currentDepth
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fonction pour récupérer et déchiffrer le token Google Drive
    async function getGoogleDriveToken(userId: string) {
      try {
        // Appel à l'Edge Function google-oauth pour obtenir un token valide et déchiffré
        const { data, error } = await supabase.functions.invoke('google-oauth', {
          body: { 
            action: 'check_token_status', 
            userId: userId 
          }
        });
        
        if (error || !data.isValid) {
          console.error("Erreur lors de la récupération du token:", error || data.error);
          throw new Error("Token invalide ou expiré");
        }
        
        // Récupérer le token déchiffré
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-oauth', {
          body: { 
            action: 'get_token', 
            userId: userId 
          }
        });
        
        if (tokenError || !tokenData.access_token) {
          console.error("Erreur lors de la récupération du token déchiffré:", tokenError);
          throw new Error("Impossible d'obtenir le token d'accès");
        }
        
        return tokenData.access_token;
      } catch (error) {
        console.error("Erreur lors de la récupération du token Google Drive:", error);
        throw error;
      }
    }

    // Récupérer le token OAuth
    const tokenData = await getGoogleDriveToken(userId);

    // Créer ou mettre à jour l'enregistrement de progression
    const { data: progress, error: progressError } = await supabase
      .from('indexing_progress')
      .upsert({
        user_id: userId,
        current_folder: folderId,
        parent_folder: parentFolderId || folderId,
        status: 'running',
        depth: currentDepth,
        processed_files: 0,
        total_files: 0,
        last_processed_file: null,
        error: null
      })
      .select()
      .single();

    if (progressError) {
      throw new Error('Erreur lors de l\'initialisation du suivi');
    }

    // Fonction pour compter le nombre total de fichiers
    const countFiles = async (folderId: string, depth: number = 0): Promise<number> => {
      let total = 0;
      let pageToken: string | undefined = undefined;

      do {
        const query = `'${folderId}' in parents and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,mimeType)${pageToken ? `&pageToken=${pageToken}` : ''}`;

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

        // Compter les fichiers
        for (const file of files) {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            if (recursive && depth < maxDepth) {
              total += await countFiles(file.id, depth + 1);
            }
          } else {
            total++;
          }
        }
      } while (pageToken);

      return total;
    };

    // Fonction récursive pour indexer les dossiers
    const indexFolderRecursively = async (options: IndexingOptions): Promise<void> => {
      console.log(`Indexation du dossier ${options.folderId} à la profondeur ${options.currentDepth}`);

      let pageToken: string | undefined = undefined;
      do {
        const query = `'${options.folderId}' in parents and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,size)&pageSize=${options.batchSize}${pageToken ? `&pageToken=${pageToken}` : ''}`;

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

        // Traiter les fichiers du lot actuel
        for (const file of files) {
          try {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
              if (options.recursive && options.currentDepth < options.maxDepth) {
                // Indexer récursivement le sous-dossier
                await indexFolderRecursively({
                  ...options,
                  folderId: file.id,
                  parentFolderId: options.folderId,
                  currentDepth: options.currentDepth + 1
                });
              }
            } else {
              // Indexer le fichier
              await supabase
                .from('indexed_documents')
                .insert({
                  user_id: options.userId,
                  provider_type: 'google_drive',
                  external_id: file.id,
                  title: file.name,
                  mime_type: file.mimeType,
                  file_size: file.size,
                  parent_folder_id: options.folderId,
                  file_path: file.name,
                  status: 'pending'
                });

              // Mettre à jour la progression
              await supabase
                .from('indexing_progress')
                .update({
                  processed_files: progress.processed_files + 1,
                  last_processed_file: file.name,
                  updated_at: new Date().toISOString()
                })
                .eq('id', progress.id);
            }
          } catch (error) {
            console.error(`Erreur lors du traitement du fichier ${file.name}:`, error);
          }
        }
      } while (pageToken);
    };

    // Démarrer le processus d'indexation en arrière-plan
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          // Compter le nombre total de fichiers
          const totalFiles = await countFiles(folderId);
          
          // Mettre à jour le nombre total de fichiers
          await supabase
            .from('indexing_progress')
            .update({ total_files: totalFiles })
            .eq('id', progress.id);

          // Démarrer l'indexation récursive
          await indexFolderRecursively({
            userId,
            folderId,
            recursive,
            maxDepth,
            batchSize,
            currentDepth: 0
          });

          // Marquer comme terminé
          await supabase
            .from('indexing_progress')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);

        } catch (error) {
          console.error('Erreur lors de l\'indexation:', error);
          
          // Mettre à jour le statut en cas d'erreur
          await supabase
            .from('indexing_progress')
            .update({
              status: 'error',
              error: JSON.stringify({
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message,
                details: error.details
              }),
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);
        }
      })()
    );

    // Répondre immédiatement avec l'ID de progression
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
      JSON.stringify({
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
