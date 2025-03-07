
import { getFileContent, processGoogleDocument, processPdfDocument } from "./documentProcessing.ts";
import { insertUploadedDocument } from "./documentService.ts";
import { getIndexingProgress, updateIndexingProgress } from "./progressService.ts";

/**
 * Indexe un dossier entier avec ses fichiers et sous-dossiers
 */
export async function indexFolder(
  supabase: any,
  userId: string,
  folderId: string,
  parentFolder: string | null,
  depth: number,
  accessToken: string,
  progressId: string,
  googleDriveApiKey: string
): Promise<void> {
  try {
    // Mise à jour de l'état de la progression
    await updateIndexingProgress(supabase, progressId, {
      current_folder: folderId,
      depth: depth
    });

    // Récupération de la liste des fichiers et dossiers dans le dossier actuel
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id, name, mimeType, size, modifiedTime)&key=${googleDriveApiKey}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Erreur lors de la récupération des fichiers du dossier ${folderId}: ${response.status} ${response.statusText}`);
      await updateIndexingProgress(supabase, progressId, {
        status: 'error',
        error: `Erreur de l'API Google Drive: ${response.status} ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();
    const files = data.files;

    if (!files || files.length === 0) {
      console.log(`Aucun fichier trouvé dans le dossier ${folderId}`);
      return;
    }

    // Mise à jour du nombre total de fichiers à traiter
    const totalFiles = files.length;
    await updateIndexingProgress(supabase, progressId, {
      total_files: totalFiles,
    });

    // Traitement de chaque fichier et sous-dossier
    for (const file of files) {
      try {
        const { id: fileId, name: fileName, mimeType, size, modifiedTime } = file;

        // Mise à jour du dernier fichier traité
        await updateIndexingProgress(supabase, progressId, {
          last_processed_file: fileName,
        });

        // Vérification du type de fichier
        if (mimeType === 'application/vnd.google-apps.folder') {
          // Si c'est un dossier, indexez-le récursivement
          console.log(`Dossier trouvé: ${fileName} (${fileId})`);
          await indexFolder(supabase, userId, fileId, folderId, depth + 1, accessToken, progressId, googleDriveApiKey);
        } else {
          // Si c'est un fichier, traitez-le
          console.log(`Fichier trouvé: ${fileName} (${fileId})`);

          let fileType = 'unknown';
          let content = null;

          if (mimeType === 'text/plain') {
            fileType = 'text';
            content = await getFileContent(fileId, accessToken);
          } else if (mimeType === 'application/pdf') {
            fileType = 'pdf';
            content = await processPdfDocument(fileId, accessToken);
          } else if (mimeType === 'application/vnd.google-apps.document') {
            fileType = 'google-document';
            content = await processGoogleDocument(fileId, accessToken);
          } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            fileType = 'docx';
            // L'extraction de texte DOCX nécessite une librairie supplémentaire
            content = null;
          }

          // Insertion des informations du fichier dans la base de données
          const filePath = parentFolder ? `${parentFolder}/${fileName}` : fileName;
          const metadata = {
            googleDriveFileId: fileId,
            modifiedTime: modifiedTime,
          };

          await insertUploadedDocument(
            supabase,
            userId,
            fileName,
            filePath,
            fileType,
            mimeType,
            size || 0,
            metadata,
            content
          );
        }

        // Mise à jour du nombre de fichiers traités
        const currentProgress = await getIndexingProgress(supabase, progressId);
        await updateIndexingProgress(supabase, progressId, {
          processed_files: currentProgress?.processed_files ? currentProgress.processed_files + 1 : 1,
        });
      } catch (innerError) {
        console.error(`Erreur lors du traitement du fichier ${file.name} (${file.id}):`, innerError);
        await updateIndexingProgress(supabase, progressId, {
          status: 'error',
          error: `Erreur lors du traitement du fichier ${file.name}: ${innerError.message}`,
        });
      }
    }

    console.log(`Dossier ${folderId} indexé avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de l'indexation du dossier ${folderId}:`, error);
    await updateIndexingProgress(supabase, progressId, {
      status: 'error',
      error: `Erreur lors de l'indexation du dossier ${folderId}: ${error.message}`,
    });
  }
}
