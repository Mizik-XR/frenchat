import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";

const env = await load();

const supabaseUrl = Deno.env.get('SUPABASE_URL') || env['SUPABASE_URL'] || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || env['SUPABASE_SERVICE_ROLE_KEY'] || '';
const googleDriveApiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY') || env['GOOGLE_DRIVE_API_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface IndexingProgress {
  id: string;
  user_id: string;
  status: string;
  total_files: number | null;
  processed_files: number | null;
  current_folder: string | null;
  parent_folder: string | null;
  last_processed_file: string | null;
  depth: number | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

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

async function updateIndexingProgress(progressId: string, updates: Partial<IndexingProgress>) {
  const { error } = await supabase
    .from('indexing_progress')
    .update(updates)
    .eq('id', progressId);

  if (error) {
    console.error('Erreur lors de la mise à jour de la progression de l\'indexation:', error);
    throw new Error(`Erreur lors de la mise à jour de la progression: ${error.message}`);
  }
}

async function insertUploadedDocument(
  userId: string,
  title: string,
  filePath: string,
  fileType: string,
  mimeType: string,
  size: number,
  metadata: any,
  content: string | null = null,
  previewUrl: string | null = null,
  contentHash: string | null = null
) {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .insert([
      {
        user_id: userId,
        title: title,
        file_path: filePath,
        file_type: fileType,
        mime_type: mimeType,
        size: size,
        metadata: metadata,
        content: content,
        preview_url: previewUrl,
        content_hash: contentHash
      },
    ])
    .select()

  if (error) {
    console.error('Erreur lors de l\'insertion du document uploadé:', error);
    throw new Error(`Erreur lors de l'insertion du document: ${error.message}`);
  }

  return data ? data[0] : null;
}

async function getFileContent(fileId: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Erreur lors de la récupération du contenu du fichier ${fileId}: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu du fichier ${fileId}:`, error);
    return null;
  }
}

async function processGoogleDocument(fileId: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Erreur lors de la récupération du contenu du Google Doc ${fileId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const htmlContent = await response.text();
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    if (!doc) {
      console.error("Impossible de parser le contenu HTML du Google Doc");
      return null;
    }

    // Extraire le texte visible
    let textContent = doc.body?.textContent || '';

    // Nettoyer le texte (supprimer les espaces inutiles et les sauts de ligne)
    textContent = textContent.replace(/\s+/g, ' ').trim();

    return textContent;
  } catch (error) {
    console.error(`Erreur lors du traitement du Google Doc ${fileId}:`, error);
    return null;
  }
}

async function indexFolder(
  userId: string,
  folderId: string,
  parentFolder: string | null,
  depth: number,
  accessToken: string,
  progressId: string
): Promise<void> {
  try {
    // Mise à jour de l'état de la progression
    await updateIndexingProgress(progressId, {
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
      await updateIndexingProgress(progressId, {
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

    // Mise à jour du nombre total de fichiers à traiter (si ce n'est pas déjà fait)
    const totalFiles = files.length;
    await updateIndexingProgress(progressId, {
      total_files: totalFiles,
    });

    // Traitement de chaque fichier et sous-dossier
    for (const file of files) {
      try {
        const { id: fileId, name: fileName, mimeType, size, modifiedTime } = file;

        // Mise à jour du dernier fichier traité
        await updateIndexingProgress(progressId, {
          last_processed_file: fileName,
        });

        // Vérification du type de fichier
        if (mimeType === 'application/vnd.google-apps.folder') {
          // Si c'est un dossier, indexez-le récursivement
          console.log(`Dossier trouvé: ${fileName} (${fileId})`);
          await indexFolder(userId, fileId, folderId, depth + 1, accessToken, progressId);
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
            // Pour les PDF, vous pouvez extraire le texte avec une librairie appropriée si nécessaire
            content = null; // L'extraction de texte PDF nécessite une librairie supplémentaire
          } else if (mimeType === 'application/vnd.google-apps.document') {
            fileType = 'google-document';
            content = await processGoogleDocument(fileId, accessToken);
          } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            fileType = 'docx';
            content = null; // L'extraction de texte DOCX nécessite une librairie supplémentaire
          }

          // Insertion des informations du fichier dans la base de données
          const filePath = parentFolder ? `${parentFolder}/${fileName}` : fileName;
          const metadata = {
            googleDriveFileId: fileId,
            modifiedTime: modifiedTime,
          };

          await insertUploadedDocument(
            userId,
            fileName,
            filePath,
            fileType,
            mimeType,
            size,
            metadata,
            content
          );
        }

        // Mise à jour du nombre de fichiers traités
        await updateIndexingProgress(progressId, {
          processed_files: (await getIndexingProgress(progressId))?.processed_files ? (await getIndexingProgress(progressId))?.processed_files! + 1 : 1,
        });
      } catch (innerError) {
        console.error(`Erreur lors du traitement du fichier ${file.name} (${file.id}):`, innerError);
        await updateIndexingProgress(progressId, {
          status: 'error',
          error: `Erreur lors du traitement du fichier ${file.name}: ${innerError.message}`,
        });
      }
    }

    console.log(`Dossier ${folderId} indexé avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de l'indexation du dossier ${folderId}:`, error);
    await updateIndexingProgress(progressId, {
      status: 'error',
      error: `Erreur lors de l'indexation du dossier ${folderId}: ${error.message}`,
    });
  }
}

async function getIndexingProgress(progressId: string): Promise<IndexingProgress | null> {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, folderId, progressId } = await req.json();
    console.log('Fonction index-google-drive invoquée avec les paramètres:', { userId, folderId, progressId });

    if (!userId || !folderId || !progressId) {
      console.error('Paramètres manquants.');
      return new Response(JSON.stringify({ error: 'Paramètres userId, folderId et progressId requis.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupération du token Google Drive
    let accessToken;
    try {
      accessToken = await getGoogleDriveToken(userId);
    } catch (tokenError) {
      console.error("Erreur lors de la récupération du token Google Drive:", tokenError);
      return new Response(JSON.stringify({ error: 'Token Google Drive invalide ou expiré.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Démarrage de l'indexation
    await updateIndexingProgress(progressId, { status: 'running' });
    await indexFolder(userId, folderId, null, 0, accessToken, progressId);
    await updateIndexingProgress(progressId, { status: 'completed' });

    return new Response(JSON.stringify({ message: 'Indexation terminée avec succès.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la fonction index-google-drive:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
