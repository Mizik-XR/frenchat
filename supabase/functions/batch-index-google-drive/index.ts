
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';

console.log("[DÉMARRAGE] Function 'batch-index-google-drive' démarrée");

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
  console.log(`[REQUÊTE] Nouvelle requête: ${req.method} ${new URL(req.url).pathname}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Réponse aux options CORS`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      userId,
      folderId,
      recursive = true,
      maxDepth = 10,
      batchSize = 100,
      parentFolderId,
      currentDepth = 0
    } = body as IndexingOptions;

    console.log('[CONFIGURATION] Options d\'indexation:', {
      userId: userId?.substring(0, 8) + '...',
      folderId,
      recursive,
      maxDepth,
      batchSize,
      parentFolderId,
      currentDepth
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[CONFIG] Connexion Supabase établie, récupération du token Google Drive`);

    async function getGoogleDriveToken(userId: string) {
      try {
        console.log(`[TOKEN] Vérification du token pour l'utilisateur ${userId.substring(0, 8)}...`);
        const { data, error } = await supabase.functions.invoke('google-oauth', {
          body: { 
            action: 'check_token_status', 
            userId: userId 
          }
        });
        
        if (error || !data.isValid) {
          console.error(`[TOKEN ERREUR] Vérification du token: ${error?.message || data?.error || 'Token invalide'}`);
          throw new Error("Token invalide ou expiré");
        }
        
        console.log(`[TOKEN] Token valide, récupération du token déchiffré`);
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-oauth', {
          body: { 
            action: 'get_token', 
            userId: userId 
          }
        });
        
        if (tokenError || !tokenData.access_token) {
          console.error(`[TOKEN ERREUR] Récupération du token déchiffré: ${tokenError?.message || 'Token manquant'}`);
          throw new Error("Impossible d'obtenir le token d'accès");
        }
        
        console.log(`[TOKEN] Token récupéré avec succès`);
        return tokenData.access_token;
      } catch (error) {
        console.error(`[TOKEN ERREUR CRITIQUE] ${error.message}`, error);
        throw error;
      }
    }

    const tokenData = await getGoogleDriveToken(userId);
    console.log(`[TOKEN] Token récupéré et valide`);

    console.log(`[PROGRESSION] Initialisation de la progression d'indexation`);
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
      console.error(`[PROGRESSION ERREUR] Initialisation: ${progressError.message}`, progressError);
      throw new Error('Erreur lors de l\'initialisation du suivi');
    }

    console.log(`[PROGRESSION] Progression initialisée avec ID: ${progress.id}`);

    const countFiles = async (folderId: string, depth: number = 0): Promise<number> => {
      let total = 0;
      let pageToken: string | undefined = undefined;

      console.log(`[COMPTAGE] Comptage des fichiers dans le dossier ${folderId} (profondeur: ${depth})`);

      do {
        const query = `'${folderId}' in parents and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,mimeType)${pageToken ? `&pageToken=${pageToken}` : ''}`;
        
        console.log(`[COMPTAGE] Requête API: ${url.substring(0, 100)}...`);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[COMPTAGE ERREUR] HTTP ${response.status} ${response.statusText}`);
          console.error(`[COMPTAGE ERREUR] Détails: ${errorText.substring(0, 500)}`);
          throw new Error(`Erreur API Google Drive: ${response.statusText}`);
        }

        const data = await response.json();
        const files: GoogleDriveFile[] = data.files;
        pageToken = data.nextPageToken;

        console.log(`[COMPTAGE] ${files.length} fichiers trouvés dans cette page`);

        for (const file of files) {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            if (recursive && depth < maxDepth) {
              console.log(`[COMPTAGE] Sous-dossier trouvé: ${file.id}, comptage récursif`);
              const subFolderCount = await countFiles(file.id, depth + 1);
              console.log(`[COMPTAGE] Sous-dossier ${file.id} contient ${subFolderCount} fichiers`);
              total += subFolderCount;
            }
          } else {
            total++;
          }
        }
        
        console.log(`[COMPTAGE] Total actuel: ${total} fichiers`);
      } while (pageToken);

      console.log(`[COMPTAGE] Total final pour le dossier ${folderId}: ${total} fichiers`);
      return total;
    };

    const indexFolderRecursively = async (options: IndexingOptions): Promise<void> => {
      console.log(`[INDEXATION] Dossier ${options.folderId} à la profondeur ${options.currentDepth}`);

      let pageToken: string | undefined = undefined;
      do {
        const query = `'${options.folderId}' in parents and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,size)&pageSize=${options.batchSize}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        
        console.log(`[INDEXATION] Requête API: ${url.substring(0, 100)}...`);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[INDEXATION ERREUR] HTTP ${response.status} ${response.statusText}`);
          console.error(`[INDEXATION ERREUR] Détails: ${errorText.substring(0, 500)}`);
          throw new Error(`Erreur API Google Drive: ${response.statusText}`);
        }

        const data = await response.json();
        const files: GoogleDriveFile[] = data.files;
        pageToken = data.nextPageToken;

        console.log(`[INDEXATION] Traitement de ${files.length} fichiers dans cette page`);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          try {
            console.log(`[FICHIER ${i+1}/${files.length}] "${file.name}" (${file.id.substring(0, 8)}...) - Type: ${file.mimeType}`);
            
            if (file.mimeType === 'application/vnd.google-apps.folder') {
              if (options.recursive && options.currentDepth < options.maxDepth) {
                console.log(`[SOUS-DOSSIER] Indexation récursive de "${file.name}"`);
                await indexFolderRecursively({
                  ...options,
                  folderId: file.id,
                  parentFolderId: options.folderId,
                  currentDepth: options.currentDepth + 1
                });
              } else {
                console.log(`[SOUS-DOSSIER] "${file.name}" ignoré (profondeur max atteinte ou récursion désactivée)`);
              }
            } else {
              console.log(`[FICHIER] Enregistrement de "${file.name}" dans indexed_documents`);
              
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

              console.log(`[FICHIER] "${file.name}" enregistré avec succès`);
              console.log(`[PROGRESSION] Mise à jour pour le fichier "${file.name}"`);
              
              await supabase
                .from('indexing_progress')
                .update({
                  processed_files: progress.processed_files + 1,
                  last_processed_file: file.name,
                  updated_at: new Date().toISOString()
                })
                .eq('id', progress.id);
                
              console.log(`[PROGRESSION] Mise à jour réussie`);
            }
          } catch (error) {
            console.error(`[FICHIER ERREUR] "${file.name}": ${error.message}`, error);
          }
        }
        
        console.log(`[INDEXATION] Page traitée, ${pageToken ? 'il reste des pages' : 'c\'était la dernière page'}`);
      } while (pageToken);
      
      console.log(`[INDEXATION] Indexation terminée pour le dossier ${options.folderId}`);
    };

    console.log(`[WORKFLOW] Démarrage du processus d'indexation en arrière-plan`);
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          console.log(`[COMPTAGE] Démarrage du comptage total des fichiers`);
          const totalFiles = await countFiles(folderId);
          console.log(`[COMPTAGE] Total: ${totalFiles} fichiers à traiter`);
          
          await supabase
            .from('indexing_progress')
            .update({ total_files: totalFiles })
            .eq('id', progress.id);
          
          console.log(`[INDEXATION] Démarrage de l'indexation récursive`);
          await indexFolderRecursively({
            userId,
            folderId,
            recursive,
            maxDepth,
            batchSize,
            currentDepth: 0
          });

          console.log(`[WORKFLOW] Indexation terminée avec succès, mise à jour du statut`);
          await supabase
            .from('indexing_progress')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);

        } catch (error) {
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
            .eq('id', progress.id);
        }
      })()
    );

    console.log(`[RÉPONSE] Envoi de la réponse avec progressId=${progress.id}`);
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
    console.error(`[ERREUR FATALE] ${error.message}`, error);
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
