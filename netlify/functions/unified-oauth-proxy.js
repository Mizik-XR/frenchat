
// Netlify Function - unified-oauth-proxy.js
// Alternative à la fonction Edge Supabase pour contourner les limitations du plan gratuit
// Peut être utilisée une fois que FileChat sera hébergé sur Netlify

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration de Supabase depuis les variables d'environnement Netlify
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Récupération des secrets depuis les variables d'environnement Netlify
const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const OAUTH_ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY;

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonctions de chiffrement/déchiffrement AES-256-CBC
function encryptData(data) {
  if (!OAUTH_ENCRYPTION_KEY) {
    throw new Error("Clé d'encryption non configurée");
  }
  
  try {
    // Générer un vecteur d'initialisation (IV) aléatoire
    const iv = crypto.randomBytes(16);
    
    // Créer le chiffreur
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(OAUTH_ENCRYPTION_KEY.substring(0, 32)), 
      iv
    );
    
    // Chiffrer les données
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Combiner l'IV et les données chiffrées
    return iv.toString('base64') + ':' + encrypted;
  } catch (error) {
    console.error("Erreur lors du chiffrement des données:", error);
    throw error;
  }
}

function decryptData(encryptedData) {
  if (!OAUTH_ENCRYPTION_KEY) {
    throw new Error("Clé d'encryption non configurée");
  }
  
  try {
    // Séparer l'IV et les données chiffrées
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error("Format de données chiffrées invalide");
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const encryptedText = parts[1];
    
    // Créer le déchiffreur
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(OAUTH_ENCRYPTION_KEY.substring(0, 32)), 
      iv
    );
    
    // Déchiffrer les données
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Erreur lors du déchiffrement des données:", error);
    throw new Error("Impossible de déchiffrer les données");
  }
}

exports.handler = async function(event, context) {
  // Gestion des requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  try {
    // Vérifier si les secrets requis sont présents
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Erreur de configuration: Secrets OAuth manquants" })
      };
    }

    if (!OAUTH_ENCRYPTION_KEY || OAUTH_ENCRYPTION_KEY.length < 32) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Erreur de configuration: Clé d'encryption manquante ou invalide (doit faire au moins 32 caractères)" })
      };
    }
    
    const body = JSON.parse(event.body);
    const { provider = 'google', code, redirectUrl, state, action, userId } = body;
    
    // Router selon le fournisseur
    if (provider === 'google') {
      // Action pour récupérer l'ID client
      if (action === 'get_client_id') {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: GOOGLE_CLIENT_ID })
        };
      }
      
      // Échange du code d'autorisation contre un token
      if (code && redirectUrl) {
        try {
          console.log("Échange du code d'autorisation contre un token...");
          
          // Préparer les informations pour l'échange du code
          const tokenEndpoint = 'https://oauth2.googleapis.com/token';
          const params = new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUrl,
            grant_type: 'authorization_code',
          });
          
          // Faire la requête pour obtenir les tokens
          const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          
          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("Erreur lors de l'échange du code:", errorData);
            throw new Error(`Échec de l'échange du code: ${tokenResponse.status} ${tokenResponse.statusText}`);
          }
          
          const tokenData = await tokenResponse.json();
          
          // Obtenir les informations de l'utilisateur avec le token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          });
          
          if (!userInfoResponse.ok) {
            throw new Error('Échec de la récupération des informations utilisateur');
          }
          
          const userInfo = await userInfoResponse.json();
          
          // Chiffrer les tokens avant le stockage
          const encryptedTokens = {
            access_token: encryptData(tokenData.access_token),
            refresh_token: tokenData.refresh_token ? encryptData(tokenData.refresh_token) : null,
            id_token: tokenData.id_token ? encryptData(tokenData.id_token) : null
          };
          
          // Sauvegarder les tokens dans la base de données
          const { data: authUser, error: authError } = await supabase.auth.getUser(tokenData.id_token);
          let currentUserId = authUser?.user?.id || userInfo.id;
          
          // Enregistrer les tokens
          const { error: tokenError } = await supabase
            .from('oauth_tokens')
            .upsert({
              user_id: currentUserId,
              provider: 'google',
              access_token: encryptedTokens.access_token,
              refresh_token: encryptedTokens.refresh_token,
              id_token: encryptedTokens.id_token,
              expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
              metadata: {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
              },
            }, { onConflict: 'user_id,provider' });
          
          if (tokenError) {
            console.error("Erreur lors de l'enregistrement des tokens:", tokenError);
            throw new Error("Échec de l'enregistrement des tokens");
          }
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, user_info: userInfo })
          };
        } catch (error) {
          console.error("Erreur pendant l'authentification Google OAuth:", error);
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
          };
        }
      }
      
      // Action pour vérifier l'état du token
      if (action === 'check_token_status' && userId) {
        try {
          console.log(`Vérification du statut du token pour l'utilisateur ${userId}`);
          
          // Récupérer le token de la base de données
          const { data: tokenData, error: tokenError } = await supabase
            .from('oauth_tokens')
            .select('access_token, expires_at')
            .eq('user_id', userId)
            .eq('provider', 'google')
            .maybeSingle();
          
          if (tokenError || !tokenData) {
            console.log("Aucun token trouvé ou erreur:", tokenError);
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ isValid: false })
            };
          }
          
          // Vérifier si le token est expiré
          const expiresAt = new Date(tokenData.expires_at);
          const now = new Date();
          const isValid = expiresAt > now;
          const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ isValid, expiresIn })
          };
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ isValid: false, error: error.message })
          };
        }
      }
      
      // Action pour rafraîchir le token
      if (action === 'refresh_token' && userId) {
        try {
          console.log(`Rafraîchissement du token pour l'utilisateur ${userId}`);
          
          // Récupérer le refresh token
          const { data: tokenData, error: tokenError } = await supabase
            .from('oauth_tokens')
            .select('refresh_token')
            .eq('user_id', userId)
            .eq('provider', 'google')
            .maybeSingle();
          
          if (tokenError || !tokenData || !tokenData.refresh_token) {
            console.log("Aucun refresh token trouvé ou erreur:", tokenError);
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ success: false, error: "Aucun refresh token disponible" })
            };
          }
          
          // Déchiffrer le refresh token
          const refreshToken = decryptData(tokenData.refresh_token);
          
          // Préparer les données pour le rafraîchissement
          const tokenEndpoint = 'https://oauth2.googleapis.com/token';
          const params = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
          });
          
          // Faire la requête pour obtenir un nouveau token
          const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          
          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("Erreur lors du rafraîchissement du token:", errorData);
            throw new Error(`Échec du rafraîchissement: ${tokenResponse.status} ${tokenResponse.statusText}`);
          }
          
          const newTokenData = await tokenResponse.json();
          
          // Chiffrer le nouveau token d'accès
          const encryptedAccessToken = encryptData(newTokenData.access_token);
          
          // Mettre à jour le token en base de données
          const { error: updateError } = await supabase
            .from('oauth_tokens')
            .update({
              access_token: encryptedAccessToken,
              expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
            })
            .eq('user_id', userId)
            .eq('provider', 'google');
          
          if (updateError) {
            console.error("Erreur lors de la mise à jour du token:", updateError);
            throw new Error("Échec de la mise à jour du token");
          }
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        } catch (error) {
          console.error("Erreur lors du rafraîchissement du token:", error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
          };
        }
      }
      
      // Action pour révoquer le token
      if (action === 'revoke_token' && userId) {
        try {
          console.log(`Révocation du token pour l'utilisateur ${userId}`);
          
          // Récupérer le token de la base de données
          const { data: tokenData, error: tokenError } = await supabase
            .from('oauth_tokens')
            .select('access_token')
            .eq('user_id', userId)
            .eq('provider', 'google')
            .maybeSingle();
          
          if (tokenError || !tokenData || !tokenData.access_token) {
            console.log("Aucun token trouvé ou erreur:", tokenError);
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ success: false, error: "Aucun token à révoquer" })
            };
          }
          
          // Déchiffrer le token d'accès
          const accessToken = decryptData(tokenData.access_token);
          
          // Révoquer le token
          const revokeEndpoint = 'https://oauth2.googleapis.com/revoke';
          const params = new URLSearchParams({ token: accessToken });
          
          const revokeResponse = await fetch(revokeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          
          // Même si la révocation échoue, supprimez le token local
          const { error: deleteError } = await supabase
            .from('oauth_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('provider', 'google');
          
          if (deleteError) {
            console.error("Erreur lors de la suppression du token:", deleteError);
            throw new Error("Échec de la suppression du token local");
          }
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        } catch (error) {
          console.error("Erreur lors de la révocation du token:", error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
          };
        }
      }
    }
    
    // Si aucune action valide n'est spécifiée
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: "Action invalide ou paramètres manquants" })
    };
  } catch (error) {
    console.error('Erreur serveur:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
