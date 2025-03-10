
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { IndexingOptions, IndexingProgress } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Service pour la gestion de la progression d'indexation
export async function initializeProgress(options: IndexingOptions): Promise<IndexingProgress> {
  console.log(`[PROGRESSION] Initialisation de la progression d'indexation`);
  const { data: progress, error: progressError } = await supabase
    .from('indexing_progress')
    .upsert({
      user_id: options.userId,
      current_folder: options.folderId,
      parent_folder: options.parentFolderId || options.folderId,
      status: 'running',
      depth: options.currentDepth || 0,
      processed_files: 0,
      total_files: 0,
      last_processed_file: null,
      error: null
    })
    .select()
    .single();

  if (progressError) {
    console.error(`[PROGRESSION ERREUR] Initialisation: ${progressError.message}`, progressError);
    throw new Error('Erreur lors de l\'initialisation du suivi');
  }

  console.log(`[PROGRESSION] Progression initialisée avec ID: ${progress.id}`);
  return progress;
}

export async function updateProgress(
  progressId: string, 
  updates: Partial<{ 
    status: 'running' | 'completed' | 'error', 
    processed_files: number, 
    total_files: number, 
    current_folder?: string,
    last_processed_file?: string,
    error?: string 
  }>
): Promise<void> {
  console.log(`[PROGRESSION] Mise à jour - ID: ${progressId}`, updates);
  
  await supabase
    .from('indexing_progress')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', progressId);
}

export async function completeProgress(progressId: string): Promise<void> {
  console.log(`[WORKFLOW] Indexation terminée avec succès, mise à jour du statut pour ${progressId}`);
  await updateProgress(progressId, { status: 'completed' });
}

export async function reportError(progressId: string, error: Error): Promise<void> {
  console.error(`[ERREUR CRITIQUE] ${error.message}`, error);
  
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
    .eq('id', progressId);
}
