
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';
import { load } from "https://deno.land/std@0.217.0/dotenv/mod.ts";

const env = await load();

const supabaseUrl = Deno.env.get('SUPABASE_URL') || env['SUPABASE_URL'] || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || env['SUPABASE_SERVICE_ROLE_KEY'] || '';
const googleDriveApiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY') || env['GOOGLE_DRIVE_API_KEY'] || '';

console.log(`[DÉMARRAGE] Function 'index-google-drive' démarrée avec URL=${supabaseUrl.substring(0, 8)}... et Google Drive API Key présente: ${!!googleDriveApiKey}`);

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

async function getGoogleDriveToken(userId: string) {
  try {
    console.log(`[TOKEN] Récupération du token pour l'utilisateur ${userId.substring(0, 8)}...`);
    
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

async function updateIndexingProgress(progressId: string, updates: Partial<IndexingProgress>) {
  console.log(`[PROGRESSION] Mise à jour de la progression ${progressId}: ${JSON.stringify(updates)}`);
  
  const { error } = await supabase
    .from('indexing_progress')
    .update(updates)
    .eq('id', progressId);

  if (error) {
    console.error(`[PROGRESSION ERREUR] Mise à jour de la progression: ${error.message}`, error);
    throw new Error(`Erreur lors de la mise à jour de la progression: ${error.message}`);
  }
  
  console.log(`[PROGRESSION] Mise à jour réussie pour ${progressId}`);
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
  console.log(`[DOCUMENT] Insertion du document "${title}" de type ${fileType}`);
  
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
    .select();

  if (error) {
    console.error(`[DOCUMENT ERREUR] Insertion du document "${title}": ${error.message}`, error);
    throw new Error(`Erreur lors de l'insertion du document: ${error.message}`);
  }

  console.log(`[DOCUMENT] Document "${title}" inséré avec succès, ID: ${data?.[0]?.id || 'inconnu'}`);
  return data ? data[0] : null;
}

async function getFileContent(fileId: string, accessToken: string): Promise<string | null> {
  try {
    console.log(`[CONTENU] Récupération du contenu pour le fichier ${fileId.substring(0, 8)}...`);
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`[CONTENU ERREUR] ${fileId}: HTTP ${response.status} ${response.statusText}`);
      return null;
    }

    const content = await response.text();
    console.log(`[CONTENU] Contenu récupéré pour ${fileId}: ${content.length} caractères`);
    return content;
  } catch (error) {
    console.error(`[CONTENU ERREUR] ${fileId}: ${error.message}`, error);
    return null;
  }
}

async function processGoogleDocument(fileId: string, accessToken: string): Promise<string | null> {
  try {
    console.log(`[DOC GOOGLE] Traitement du Google Doc ${fileId.substring(0, 8)}...`);
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`[DOC GOOGLE ERREUR] ${fileId}: HTTP ${response.status} ${response.statusText}`);
      return null;
    }

    const htmlContent = await response.text();
    console.log(`[DOC GOOGLE] HTML récupéré pour ${fileId}: ${htmlContent.length} caractères`);
    
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    if (!doc) {
      console.error(`[DOC GOOGLE ERREUR] Impossible de parser le HTML pour ${fileId}`);
      return null;
    }

    // Extraire le texte visible
    let textContent = doc.body?.textContent || '';

    // Nettoyer le texte (supprimer les espaces inutiles et les sauts de ligne)
    textContent = textContent.replace(/\s+/g, ' ').trim();
    console.log(`[DOC GOOGLE] Texte extrait pour ${fileId}: ${textContent.length} caractères`);

    return textContent;
  } catch (error) {
    console.error(`[DOC GOOGLE ERREUR] ${fileId}: ${error.message}`, error);
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
    console.log(`[DOSSIER] Indexation du dossier ${folderId} (profondeur: ${depth})`);
    
    // Mise à jour de l'état de la progression
    await updateIndexingProgress(progressId, {
      current_folder: folderId,
      depth: depth
    });

    // Récupération de la liste des fichiers et dossiers dans le dossier actuel
    console.log(`[DOSSIER] Récupération des fichiers dans ${folderId}`);
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id, name, mimeType, size, modifiedTime)&key=${googleDriveApiKey}`;
    console.log(`[DOSSIER] URL API: ${url.substring(0, 100)}...`);
    
    const response = await fetch(
      url,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DOSSIER ERREUR] Récupération des fichiers: HTTP ${response.status} ${response.statusText}`);
      console.error(`[DOSSIER ERREUR] Détails: ${errorText.substring(0, 500)}`);
      
      await updateIndexingProgress(progressId, {
        status: 'error',
        error: `Erreur de l'API Google Drive: ${response.status} ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();
    const files = data.files;

    if (!files || files.length === 0) {
      console.log(`[DOSSIER] Aucun fichier dans le dossier ${folderId}`);
      return;
    }

    console.log(`[DOSSIER] ${files.length} fichiers trouvés dans ${folderId}`);

    // Mise à jour du nombre total de fichiers à traiter (si ce n'est pas déjà fait)
    const totalFiles = files.length;
    await updateIndexingProgress(progressId, {
      total_files: totalFiles,
    });

    // Traitement de chaque fichier et sous-dossier
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const { id: fileId, name: fileName, mimeType, size, modifiedTime } = file;
        console.log(`[FICHIER ${i+1}/${files.length}] Traitement de "${fileName}" (${fileId.substring(0, 8)}...) - Type: ${mimeType}`);

        // Mise à jour du dernier fichier traité
        await updateIndexingProgress(progressId, {
          last_processed_file: fileName,
        });

        // Vérification du type de fichier
        if (mimeType === 'application/vnd.google-apps.folder') {
          // Si c'est un dossier, indexez-le récursivement
          console.log(`[DOSSIER RÉCURSIF] Traitement du sous-dossier "${fileName}"`);
          await indexFolder(userId, fileId, folderId, depth + 1, accessToken, progressId);
        } else {
          // Si c'est un fichier, traitez-le
          console.log(`[FICHIER] Traitement du fichier "${fileName}"`);

          let fileType = 'unknown';
          let content = null;

          if (mimeType === 'text/plain') {
            fileType = 'text';
            content = await getFileContent(fileId, accessToken);
          } else if (mimeType === 'application/pdf') {
            fileType = 'pdf';
            console.log(`[FICHIER] Fichier PDF, pas d'extraction de contenu pour ${fileId}`);
          } else if (mimeType === 'application/vnd.google-apps.document') {
            fileType = 'google-document';
            content = await processGoogleDocument(fileId, accessToken);
          } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            fileType = 'docx';
            console.log(`[FICHIER] Fichier DOCX, pas d'extraction de contenu pour ${fileId}`);
          } else {
            console.log(`[FICHIER] Type de fichier non supporté pour l'extraction: ${mimeType}`);
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
        const progress = await getIndexingProgress(progressId);
        const processedFiles = (progress?.processed_files || 0) + 1;
        
        await updateIndexingProgress(progressId, {
          processed_files: processedFiles,
        });
        
        console.log(`[PROGRESSION] ${processedFiles}/${totalFiles} fichiers traités (${Math.round((processedFiles/totalFiles)*100)}%)`);
      } catch (innerError) {
        console.error(`[FICHIER ERREUR] Erreur lors du traitement de "${file.name}" (${file.id}): ${innerError.message}`, innerError);
        await updateIndexingProgress(progressId, {
          status: 'error',
          error: `Erreur lors du traitement du fichier ${file.name}: ${innerError.message}`,
        });
      }
    }

    console.log(`[DOSSIER] Dossier ${folderId} indexé avec succès`);
  } catch (error) {
    console.error(`[DOSSIER ERREUR CRITIQUE] Dossier ${folderId}: ${error.message}`, error);
    await updateIndexingProgress(progressId, {
      status: 'error',
      error: `Erreur lors de l'indexation du dossier ${folderId}: ${error.message}`,
    });
  }
}

async function getIndexingProgress(progressId: string): Promise<IndexingProgress | null> {
  console.log(`[PROGRESSION] Récupération de la progression ${progressId}`);
  
  const { data, error } = await supabase
    .from('indexing_progress')
    .select('*')
    .eq('id', progressId)
    .single();

  if (error) {
    console.error(`[PROGRESSION ERREUR] Récupération de la progression: ${error.message}`, error);
    return null;
  }

  return data;
}

serve(async (req) => {
  console.log(`[REQUÊTE] Nouvelle requête: ${req.method} ${new URL(req.url).pathname}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Réponse aux options CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, folderId, progressId } = body;
    
    console.log(`[REQUÊTE] Paramètres: userId=${userId?.substring(0, 8)}... folderId=${folderId} progressId=${progressId}`);

    if (!userId || !folderId || !progressId) {
      console.error(`[VALIDATION] Paramètres manquants: userId=${!!userId}, folderId=${!!folderId}, progressId=${!!progressId}`);
      return new Response(JSON.stringify({ error: 'Paramètres userId, folderId et progressId requis.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupération du token Google Drive
    console.log(`[WORKFLOW] Récupération du token Google Drive`);
    let accessToken;
    try {
      accessToken = await getGoogleDriveToken(userId);
    } catch (tokenError) {
      console.error(`[TOKEN ERREUR] ${tokenError.message}`, tokenError);
      return new Response(JSON.stringify({ error: 'Token Google Drive invalide ou expiré.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Démarrage de l'indexation
    console.log(`[WORKFLOW] Démarrage de l'indexation pour le dossier ${folderId}`);
    await updateIndexingProgress(progressId, { status: 'running' });
    await indexFolder(userId, folderId, null, 0, accessToken, progressId);
    await updateIndexingProgress(progressId, { status: 'completed' });
    console.log(`[WORKFLOW] Indexation terminée avec succès pour le dossier ${folderId}`);

    return new Response(JSON.stringify({ message: 'Indexation terminée avec succès.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[ERREUR CRITIQUE] ${error.message}`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
