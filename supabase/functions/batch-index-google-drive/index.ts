
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsOptions, addCorsHeaders } from '../_shared/cors.ts';
import { IndexingOptions } from './types.ts';
import { getGoogleDriveToken } from './token-service.ts';
import { initializeProgress, updateProgress, completeProgress, reportError } from './progress-service.ts';
import { countFiles, indexFolderRecursively } from './file-service.ts';

console.log("[DÉMARRAGE] Function 'batch-index-google-drive' démarrée");

serve(async (req) => {
  console.log(`[REQUÊTE] Nouvelle requête: ${req.method} ${new URL(req.url).pathname}`);
  
  // Gestion des requêtes OPTIONS (CORS preflight)
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) {
    return corsResponse;
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

    // Récupération du token d'accès Google Drive
    const accessToken = await getGoogleDriveToken(userId);
    console.log(`[TOKEN] Token récupéré et valide`);

    // Initialisation de la progression
    const progress = await initializeProgress({
      userId,
      folderId,
      recursive,
      maxDepth,
      batchSize,
      parentFolderId,
      currentDepth
    });

    console.log(`[WORKFLOW] Démarrage du processus d'indexation en arrière-plan`);
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          // Comptage des fichiers
          console.log(`[COMPTAGE] Démarrage du comptage total des fichiers`);
          const totalFiles = await countFiles(accessToken, folderId, 0, maxDepth, recursive);
          console.log(`[COMPTAGE] Total: ${totalFiles} fichiers à traiter`);
          
          // Mise à jour du nombre total de fichiers
          await updateProgress(progress.id, { total_files: totalFiles });
          
          // Indexation des fichiers
          console.log(`[INDEXATION] Démarrage de l'indexation récursive`);
          await indexFolderRecursively(
            accessToken,
            {
              userId,
              folderId,
              recursive,
              maxDepth,
              batchSize,
              currentDepth: 0
            },
            progress.id
          );

          // Marquer l'indexation comme terminée
          await completeProgress(progress.id);

        } catch (error) {
          // Gestion des erreurs
          await reportError(progress.id, error);
        }
      })()
    );

    console.log(`[RÉPONSE] Envoi de la réponse avec progressId=${progress.id}`);
    return addCorsHeaders(new Response(
      JSON.stringify({
        success: true,
        progressId: progress.id
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    ));

  } catch (error) {
    console.error(`[ERREUR FATALE] ${error.message}`, error);
    return addCorsHeaders(new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    ));
  }
});
