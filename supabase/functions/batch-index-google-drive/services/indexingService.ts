
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

interface ProgressRecord {
  id: string;
  processed_files: number;
  [key: string]: any;
}

/**
 * Compte le nombre total de fichiers dans un dossier et ses sous-dossiers
 */
export async function countFiles(folderId: string, tokenData: any, depth: number = 0, maxDepth: number = 10, recursive: boolean = true): Promise<number> {
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

    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        if (recursive && depth < maxDepth) {
          total += await countFiles(file.id, tokenData, depth + 1, maxDepth, recursive);
        }
      } else {
        total++;
      }
    }
  } while (pageToken);

  return total;
}

/**
 * Indexe récursivement un dossier et ses sous-dossiers
 */
export async function indexFolderRecursively(
  options: IndexingOptions,
  tokenData: any,
  progress: ProgressRecord,
  supabase: any
): Promise<void> {
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

    for (const file of files) {
      try {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          if (options.recursive && options.currentDepth < options.maxDepth) {
            await indexFolderRecursively({
              ...options,
              folderId: file.id,
              parentFolderId: options.folderId,
              currentDepth: options.currentDepth + 1
            }, tokenData, progress, supabase);
          }
        } else {
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
}
