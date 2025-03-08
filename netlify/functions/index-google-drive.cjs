
/**
 * Fonction d'indexation Google Drive pour Netlify (CommonJS)
 * Version compatible avec l'environnement Netlify Functions
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration pour CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Fonction principale exportée pour Netlify
exports.handler = async function(event, context) {
  // Support pour les requêtes OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Journalisation détaillée
  console.log('Fonction index-google-drive invoquée.');

  try {
    // Analyse du corps de la requête
    const payload = JSON.parse(event.body);
    const { userId, folderId, progressId } = payload;

    console.log('Paramètres reçus:', { userId, folderId, progressId });

    // Validation des paramètres
    if (!userId || !folderId || !progressId) {
      console.error('Paramètres manquants.');
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Paramètres userId, folderId et progressId requis.' })
      };
    }

    // Initialisation du client Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Récupération du token Google Drive
    let accessToken;
    try {
      accessToken = await getGoogleDriveToken(userId, supabase);
    } catch (tokenError) {
      console.error("Erreur lors de la récupération du token Google Drive:", tokenError);
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Token Google Drive invalide ou expiré.' })
      };
    }

    // Démarrage de l'indexation
    await updateIndexingProgress(supabase, progressId, { status: 'running' });

    // Traiter l'indexation de manière asynchrone
    // Note: Netlify Functions a une limite de 10 secondes, donc nous initialisons le processus
    // mais ne pouvons pas attendre sa fin complète ici.
    console.log('Démarrage du processus d\'indexation pour le dossier:', folderId);
    
    // Mettre à jour le statut
    await indexFolder(supabase, userId, folderId, null, 0, accessToken, progressId, process.env.GOOGLE_DRIVE_API_KEY);
    await updateIndexingProgress(supabase, progressId, { status: 'completed' });

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Indexation terminée avec succès.',
        progressId
      })
    };
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la fonction index-google-drive:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Erreur interne du serveur' })
    };
  }
};

/**
 * Récupère le token Google Drive pour un utilisateur
 */
async function getGoogleDriveToken(userId, supabase) {
  try {
    // Récupération des informations de connexion de l'utilisateur
    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token, expires_at, provider')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (error || !data) {
      throw new Error('Token non trouvé');
    }

    // Vérifier si le token est expiré
    const now = Math.floor(Date.now() / 1000);
    if (data.expires_at < now) {
      // Le token est expiré, il faut le rafraîchir
      const refreshedToken = await refreshGoogleToken(data.refresh_token, supabase);
      return refreshedToken;
    }

    return data.access_token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token Google Drive:', error);
    throw error;
  }
}

/**
 * Rafraîchit un token Google expiré
 */
async function refreshGoogleToken(refreshToken, supabase) {
  // Cette fonction devrait appeler l'API Google pour rafraîchir le token
  // Implémentation simplifiée pour l'exemple
  throw new Error('Rafraîchissement de token Google non implémenté');
}

/**
 * Met à jour le statut de progression de l'indexation
 */
async function updateIndexingProgress(supabase, progressId, updates) {
  try {
    updates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('indexing_progress')
      .update(updates)
      .eq('id', progressId);
    
    if (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    throw error;
  }
}

/**
 * Indexe un dossier Google Drive
 */
async function indexFolder(supabase, userId, folderId, parentId, depth, accessToken, progressId, apiKey) {
  try {
    // Implémentation simplifiée pour l'exemple
    // Dans une vraie implémentation, cette fonction devrait:
    // 1. Récupérer la liste des fichiers/dossiers dans le dossier actuel
    // 2. Indexer les fichiers
    // 3. Appeler récursivement cette fonction pour les sous-dossiers
    
    // Simulation d'indexation
    await updateIndexingProgress(supabase, progressId, { 
      processed_files: 10,
      current_folder: folderId,
      status: 'processing'
    });
    
    // Dans une vraie implémentation, cette fonction serait beaucoup plus complexe
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'indexation du dossier:', error);
    await updateIndexingProgress(supabase, progressId, { 
      status: 'error',
      error: JSON.stringify(error)
    });
    throw error;
  }
}
