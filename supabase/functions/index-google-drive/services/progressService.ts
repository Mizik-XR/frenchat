
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Met à jour le statut de progression de l'indexation
 */
export async function updateIndexingProgress(
  supabase: any,
  progressId: string, 
  updates: Partial<any>
): Promise<void> {
  const { error } = await supabase
    .from('indexing_progress')
    .update(updates)
    .eq('id', progressId);

  if (error) {
    console.error('Erreur lors de la mise à jour de la progression de l\'indexation:', error);
    throw new Error(`Erreur lors de la mise à jour de la progression: ${error.message}`);
  }
}

/**
 * Récupère la progression d'indexation actuelle
 */
export async function getIndexingProgress(supabase: any, progressId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('indexing_progress')
    .select('*')
    .eq('id', progressId)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération de la progression de l\'indexation:', error);
    return null;
  }

  return data;
}
