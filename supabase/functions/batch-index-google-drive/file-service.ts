
import { GoogleDriveFile, IndexingOptions } from './types.ts';
import { updateProgress } from './progress-service.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Service pour compter les fichiers dans un dossier Google Drive
export async function countFiles(accessToken: string, folderId: string, depth: number = 0, maxDepth: number = 10, recursive: boolean = true): Promise<number> {
  let total = 0;
  let pageToken: string | undefined = undefined;

  console.log(`[COMPTAGE] Comptage des fichiers dans le dossier ${folderId} (profondeur: ${depth})`);

  do {
    const query = `'${folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,mimeType)${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
    console.log(`[COMPTAGE] Requête API: ${url.substring(0, 100)}...`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
          const subFolderCount = await countFiles(accessToken, file.id, depth + 1, maxDepth, recursive);
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
}

// Service pour indexer les fichiers d'un dossier Google Drive
export async function indexFolderRecursively(
  accessToken: string,
  options: IndexingOptions,
  progressId: string
): Promise<void> {
  console.log(`[INDEXATION] Dossier ${options.folderId} à la profondeur ${options.currentDepth}`);

  let pageToken: string | undefined = undefined;
  do {
    const query = `'${options.folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType,size)&pageSize=${options.batchSize}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
    console.log(`[INDEXATION] Requête API: ${url.substring(0, 100)}...`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
            await indexFolderRecursively(
              accessToken,
              {
                ...options,
                folderId: file.id,
                parentFolderId: options.folderId,
                currentDepth: options.currentDepth + 1
              },
              progressId
            );
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
          
          await updateProgress(progressId, {
            processed_files: file.processed_files + 1,
            last_processed_file: file.name
          });
            
          console.log(`[PROGRESSION] Mise à jour réussie`);
        }
      } catch (error) {
        console.error(`[FICHIER ERREUR] "${file.name}": ${error.message}`, error);
      }
    }
    
    console.log(`[INDEXATION] Page traitée, ${pageToken ? 'il reste des pages' : 'c\'était la dernière page'}`);
  } while (pageToken);
  
  console.log(`[INDEXATION] Indexation terminée pour le dossier ${options.folderId}`);
}
