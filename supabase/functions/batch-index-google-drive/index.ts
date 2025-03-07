
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/corsHeaders.ts';
import { getGoogleDriveToken } from './services/googleDriveAuth.ts';
import { countFiles, indexFolderRecursively } from './services/indexingService.ts';

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

    const tokenData = await getGoogleDriveToken(userId);

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

    EdgeRuntime.waitUntil(
      (async () => {
        try {
          const totalFiles = await countFiles(folderId, tokenData, 0, maxDepth, recursive);
          
          await supabase
            .from('indexing_progress')
            .update({ total_files: totalFiles })
            .eq('id', progress.id);

          await indexFolderRecursively({
            userId,
            folderId,
            recursive,
            maxDepth,
            batchSize,
            currentDepth: 0
          }, tokenData, progress, supabase);

          await supabase
            .from('indexing_progress')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);

        } catch (error) {
          console.error('Erreur lors de l\'indexation:', error);
          
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
