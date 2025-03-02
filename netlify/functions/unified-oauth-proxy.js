const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Création du client Supabase avec la clé de service pour accéder à toutes les tables
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// En-têtes CORS pour permettre les appels depuis le frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Clé pour le chiffrement AES-256 (dérivée du secret)
function getEncryptionKey() {
  // Utiliser un secret d'environnement pour dériver une clé de chiffrement
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret-key';
  return crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
}

// Fonction pour chiffrer les tokens avant stockage
function encryptToken(token) {
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(getEncryptionKey(), 'utf-8');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  } catch (error) {
    console.error('Erreur de chiffrement:', error);
    throw new Error('Impossible de sécuriser le token');
  }
}

// Fonction pour déchiffrer les tokens stockés
function decryptToken(encryptedData) {
  try {
    const key = Buffer.from(getEncryptionKey(), 'utf-8');
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

// Fonction d'échange du code d'autorisation Google pour des tokens d'accès
async function exchangeGoogleAuthCode(code, redirectUrl) {
  const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    throw new Error("Configurations OAuth manquantes");
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: redirectUrl,
    grant_type: 'authorization_code'
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google OAuth Error Response:', errorText);
      throw new Error(`Erreur lors de l'échange du code: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Erreur lors de l\'échange du code d\'autorisation:', error);
    throw error;
  }
}

// Fonction pour récupérer les informations de l'utilisateur Google
async function getGoogleUserInfo(accessToken) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des informations utilisateur: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    throw error;
  }
}

// Fonction pour sauvegarder les tokens dans la base de données
async function saveOAuthTokens(userId, provider, tokens, userInfo) {
  // Chiffrer les tokens sensibles
  const encryptedAccessToken = encryptToken(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

  try {
    // Vérifier si l'utilisateur a déjà des tokens pour ce provider
    const { data: existingTokens, error: fetchError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur lors de la vérification des tokens existants:', fetchError);
      throw fetchError;
    }

    // Préparer les données des tokens
    const tokenData = {
      user_id: userId,
      provider,
      access_token: JSON.stringify(encryptedAccessToken),
      refresh_token: encryptedRefreshToken ? JSON.stringify(encryptedRefreshToken) : null,
      expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      token_type: tokens.token_type,
      scope: tokens.scope,
      user_info: userInfo ? JSON.stringify(userInfo) : null,
      is_valid: true,
      metadata: {
        updated_at: new Date().toISOString(),
        ip_address: null // Optionnel: Vous pourriez récupérer l'IP du client
      }
    };

    if (existingTokens) {
      // Mise à jour des tokens existants
      const { error: updateError } = await supabase
        .from('oauth_tokens')
        .update(tokenData)
        .eq('id', existingTokens.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des tokens:', updateError);
        throw updateError;
      }
    } else {
      // Insertion de nouveaux tokens
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .insert([tokenData]);

      if (insertError) {
        console.error('Erreur lors de l\'insertion des tokens:', insertError);
        throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des tokens:', error);
    throw error;
  }
}

// Fonction pour rafraîchir un token expiré
async function refreshGoogleToken(userId) {
  try {
    // Récupérer le refresh token de l'utilisateur
    const { data: tokenData, error: fetchError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération du refresh token:', fetchError);
      throw new Error('Impossible de récupérer le refresh token');
    }

    if (!tokenData.refresh_token) {
      throw new Error('Aucun refresh token disponible');
    }

    // Déchiffrer le refresh token
    const encryptedRefreshToken = JSON.parse(tokenData.refresh_token);
    const refreshToken = decryptToken(encryptedRefreshToken);

    // Appeler l'API Google pour rafraîchir le token
    const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google OAuth Refresh Error:', errorText);
      
      // Marquer le token comme invalide si le rafraîchissement échoue
      await supabase
        .from('oauth_tokens')
        .update({ is_valid: false })
        .eq('id', tokenData.id);
        
      throw new Error(`Erreur lors du rafraîchissement du token: ${response.status}`);
    }

    // Traiter la réponse
    const newTokenData = await response.json();
    
    // Chiffrer le nouveau token d'accès
    const encryptedAccessToken = encryptToken(newTokenData.access_token);
    
    // Mettre à jour le token dans la base de données
    const { error: updateError } = await supabase
      .from('oauth_tokens')
      .update({
        access_token: JSON.stringify(encryptedAccessToken),
        expires_at: newTokenData.expires_in ? new Date(Date.now() + newTokenData.expires_in * 1000).toISOString() : null,
        is_valid: true,
        metadata: {
          ...tokenData.metadata,
          refreshed_at: new Date().toISOString()
        }
      })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du token rafraîchi:', updateError);
      throw updateError;
    }

    return {
      success: true,
      expires_in: newTokenData.expires_in
    };
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    throw error;
  }
}

// Fonction pour vérifier le statut d'un token
async function checkTokenStatus(userId) {
  try {
    // Récupérer le token de l'utilisateur
    const { data: tokenData, error: fetchError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return { isValid: false, message: "Aucun token trouvé" };
      }
      console.error('Erreur lors de la vérification du token:', fetchError);
      throw fetchError;
    }

    // Vérifier si le token est marqué comme invalide
    if (!tokenData.is_valid) {
      return { isValid: false, message: "Token marqué comme invalide" };
    }

    // Vérifier si le token est expiré
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      return { 
        isValid: false, 
        message: "Token expiré", 
        expired: true,
        expiresAt: expiresAt.toISOString()
      };
    }

    // Calculer le temps restant avant expiration (en secondes)
    const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

    return {
      isValid: true,
      expiresIn,
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du token:', error);
    throw error;
  }
}

// Fonction pour révoquer un token Google
async function revokeGoogleToken(userId) {
  try {
    // Récupérer le token de l'utilisateur
    const { data: tokenData, error: fetchError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération du token à révoquer:', fetchError);
      throw new Error('Impossible de récupérer le token');
    }

    // Déchiffrer le token d'accès
    const encryptedAccessToken = JSON.parse(tokenData.access_token);
    const accessToken = decryptToken(encryptedAccessToken);

    // Appeler l'API Google pour révoquer le token
    const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${accessToken}`;
    const response = await fetch(revokeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Même si la révocation échoue, marquer le token comme invalide localement
    await supabase
      .from('oauth_tokens')
      .update({ 
        is_valid: false,
        metadata: {
          ...tokenData.metadata,
          revoked_at: new Date().toISOString()
        }
      })
      .eq('id', tokenData.id);

    if (!response.ok) {
      console.warn(`La révocation du token a échoué avec le code ${response.status}, mais le token a été marqué comme invalide localement.`);
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la révocation du token:', error);
    throw error;
  }
}

// Gestionnaire de requêtes principal
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
    const { provider, code, redirectUrl, action, userId, state } = body;

    // Validation des entrées
    if (!provider) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Provider manquant' })
      };
    }

    // Gestion des différentes actions en fonction du provider
    if (provider === 'google') {
      // Récupération du client ID Google (action spécifique)
      if (action === 'get_client_id') {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ client_id: process.env.GOOGLE_OAUTH_CLIENT_ID })
        };
      }

      // Échange du code d'autorisation contre des tokens
      if (code && redirectUrl) {
        const tokenData = await exchangeGoogleAuthCode(code, redirectUrl);
        const userInfo = await getGoogleUserInfo(tokenData.access_token);

        // Si un userId est fourni, sauvegarder les tokens
        if (userId) {
          await saveOAuthTokens(userId, 'google', tokenData, userInfo);
        }

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            user_info: userInfo,
            token_status: { 
              is_valid: true, 
              expires_in: tokenData.expires_in 
            }
          })
        };
      }

      // Vérification du statut du token
      if (action === 'check_token_status' && userId) {
        const tokenStatus = await checkTokenStatus(userId);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(tokenStatus)
        };
      }

      // Rafraîchissement du token
      if (action === 'refresh_token' && userId) {
        const refreshResult = await refreshGoogleToken(userId);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(refreshResult)
        };
      }

      // Révocation du token
      if (action === 'revoke_token' && userId) {
        const revokeResult = await revokeGoogleToken(userId);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(revokeResult)
        };
      }
    }

    // Requête invalide si on arrive ici
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Requête invalide ou incomplète' })
    };
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Erreur interne du serveur' })
    };
  }
};
