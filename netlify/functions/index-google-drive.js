
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Création du client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// En-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Fonction pour déchiffrer les tokens OAuth stockés
function decryptToken(encryptedData) {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    throw new Error('Impossible de déchiffrer le token');
  }
}

// Fonction pour obtenir la clé de chiffrement
function getEncryptionKey() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret-key';
  return Buffer.from(
    crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32),
    'utf-8'
  );
}

// Fonction pour créer un nouvel enregistrement de progression
async function createProgressRecord(userId, options = {}) {
  try {
    const { data, error } = await supabase
      .from('indexing_progress')
      .insert([{
        user_id: userId,
        status: 'initializing',
        total_files: 0,
        processed_files: 0,
        parent_folder: options.folderId || null,
        settings: {
          recursive: options.recursive || false,
          max_depth: options.maxDepth || 10,
          batch_size: options.batchSize || 100,
          file_types: options.fileTypes || ['document', 'spreadsheet', 'presentation', 'pdf'],
          is_shared: options.isShared || false,
          share_with: options.shareWith || []
        }
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'enregistrement de progression:', error);
    throw error;
  }
}

// Fonction pour mettre à jour la progression
async function updateProgress(progressId, status, processed, total, currentFolder = null, error = null) {
  try {
    const { data, error: updateError } = await supabase
      .from('indexing_progress')
      .update({
        status: status,
        processed_files: processed,
        total_files: total,
        current_folder: currentFolder,
        error: error,
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId)
      .select();

    if (updateError) throw updateError;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
  }
}

// Fonction pour récupérer le token d'accès de l'utilisateur
async function getUserAccessToken(userId) {
  try {
    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .eq('is_valid', true)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Aucun token trouvé pour cet utilisateur');

    // Déchiffrer le token d'accès
    const encryptedToken = JSON.parse(data.access_token);
    const accessToken = decryptToken(encryptedToken);

    return {
      accessToken,
      expiresAt: new Date(data.expires_at)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    throw error;
  }
}

// Fonction pour récupérer les méta-données d'un dossier Google Drive
async function getDriveFolderMetadata(folderId, accessToken) {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,parents`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Google Drive:', errorData);
      throw new Error(`Erreur lors de la récupération des méta-données du dossier: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des méta-données:', error);
    throw error;
  }
}

// Fonction pour récupérer tous les fichiers d'un dossier
async function listDriveFiles(folderId, accessToken, pageToken = null) {
  try {
    let url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime)&pageSize=1000`;
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Google Drive API:', errorData);
      throw new Error(`Erreur lors de la récupération des fichiers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

// Fonction principale d'indexation (version simplifiée)
async function indexDriveFolder(userId, folderId, progressId, options = {}) {
  try {
    // Récupérer le token d'accès
    const { accessToken } = await getUserAccessToken(userId);
    
    // Récupérer les méta-données du dossier
    const folderMetadata = await getDriveFolderMetadata(folderId, accessToken);
    
    // Initialiser l'indexation
    await updateProgress(progressId, 'running', 0, 0, folderMetadata.name);
    
    // Récupérer tous les fichiers du dossier
    let allFiles = [];
    let nextPageToken = null;
    
    do {
      const filesData = await listDriveFiles(folderId, accessToken, nextPageToken);
      allFiles = [...allFiles, ...filesData.files];
      nextPageToken = filesData.nextPageToken;
      
      // Mettre à jour la progression
      await updateProgress(progressId, 'running', allFiles.length, allFiles.length * 2, folderMetadata.name);
      
    } while (nextPageToken);
    
    // Filtrer les dossiers pour traitement récursif si nécessaire
    const folders = allFiles.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
    const files = allFiles.filter(file => file.mimeType !== 'application/vnd.google-apps.folder');
    
    // Mettre à jour le nombre total de fichiers
    const totalFiles = files.length + (options.recursive ? folders.length * 10 : 0); // Estimation
    await updateProgress(progressId, 'running', 0, totalFiles, folderMetadata.name);
    
    // Stocker les métadonnées du dossier
    await supabase
      .from('google_drive_folders')
      .upsert([{
        user_id: userId,
        folder_id: folderId,
        name: folderMetadata.name,
        path: folderMetadata.name,
        is_indexed: true,
        last_indexed: new Date().toISOString(),
        is_shared: options.isShared || false,
        shared_with: options.shareWith || [],
        metadata: {
          total_files: files.length,
          total_folders: folders.length,
          mime_types: [...new Set(files.map(f => f.mimeType))],
          parent_id: folderMetadata.parents ? folderMetadata.parents[0] : null
        }
      }], { onConflict: 'folder_id' });
    
    // Simuler le traitement des fichiers (version simplifiée)
    // Dans une implémentation réelle, vous traiteriez chaque fichier pour l'indexation
    let processedCount = 0;
    
    // Simuler l'indexation des fichiers
    for (const file of files) {
      // Stocker les métadonnées du fichier
      await supabase
        .from('indexed_documents')
        .upsert([{
          user_id: userId,
          document_id: file.id,
          folder_id: folderId,
          title: file.name,
          document_type: file.mimeType,
          status: 'indexed',
          metadata: {
            size: file.size,
            created_time: file.createdTime,
            modified_time: file.modifiedTime
          }
        }], { onConflict: 'document_id' });
        
      processedCount++;
      
      // Mettre à jour la progression
      if (processedCount % 10 === 0 || processedCount === files.length) {
        await updateProgress(progressId, 'running', processedCount, totalFiles, folderMetadata.name);
      }
    }
    
    // Indexation terminée
    await updateProgress(progressId, 'completed', totalFiles, totalFiles, folderMetadata.name);
    
    return {
      success: true,
      total_files: files.length,
      total_folders: folders.length,
      folder_name: folderMetadata.name
    };
  } catch (error) {
    console.error('Erreur lors de l\'indexation:', error);
    await updateProgress(progressId, 'error', 0, 0, null, error.message);
    throw error;
  }
}

// Gestionnaire de la fonction serverless
exports.handler = async (event, context) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Vérification de la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Méthode non autorisée' })
      };
    }

    // Parsing du corps de la requête
    const body = JSON.parse(event.body || '{}');
    const { folderId, options = {}, userId, mode } = body;

    // Validation des entrées
    if (!folderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'ID de dossier manquant' })
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'ID utilisateur manquant' })
      };
    }

    // Déterminer le mode d'indexation (singleton ou batch)
    const indexingMode = mode || 'singleton';

    // Créer un enregistrement de progression
    const progressId = await createProgressRecord(userId, { 
      folderId, 
      ...options 
    });

    // Exécuter l'indexation en arrière-plan
    if (indexingMode === 'batch') {
      // Pour le mode batch, nous retournons immédiatement et continuons l'indexation en arrière-plan
      // Ceci est une simulation, dans une implémentation réelle vous utiliseriez une queue
      setTimeout(() => {
        indexDriveFolder(userId, folderId, progressId, options)
          .catch(error => console.error('Erreur d\'indexation en batch:', error));
      }, 10);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Indexation démarrée en arrière-plan',
          progressId
        })
      };
    } else {
      // Mode singleton: exécuter l'indexation et attendre le résultat
      await indexDriveFolder(userId, folderId, progressId, options);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Indexation terminée',
          progressId
        })
      };
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Erreur interne du serveur' })
    };
  }
};
