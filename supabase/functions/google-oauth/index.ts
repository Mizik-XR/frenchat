import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const googleClientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const googleClientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
const tokenEncryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || '';

// Initialisation du client Supabase avec la clé de service pour les opérations administratives
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fonctions de chiffrement et déchiffrement des tokens
function encryptToken(token: string): string {
  try {
    if (!tokenEncryptionKey) {
      console.error("Erreur: TOKEN_ENCRYPTION_KEY non définie");
      throw new Error("Configuration de chiffrement manquante");
    }

    // Dérivation de la clé à partir de la clé principale
    const key = scryptSync(tokenEncryptionKey, 'salt', 32);
    
    // Génération d'un vecteur d'initialisation aléatoire
    const iv = randomBytes(16);
    
    // Création du chiffreur
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    
    // Chiffrement du token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Concaténation de l'IV et du texte chiffré pour stockage
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error("Erreur lors du chiffrement du token:", error);
    throw new Error("Échec du chiffrement");
  }
}

function decryptToken(encryptedToken: string): string {
  try {
    if (!tokenEncryptionKey) {
      console.error("Erreur: TOKEN_ENCRYPTION_KEY non définie");
      throw new Error("Configuration de chiffrement manquante");
    }

    // Séparation de l'IV et du texte chiffré
    const parts = encryptedToken.split(':');
    if (parts.length !== 2) {
      throw new Error("Format de token chiffré invalide");
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Dérivation de la clé (identique à celle utilisée pour le chiffrement)
    const key = scryptSync(tokenEncryptionKey, 'salt', 32);
    
    // Création du déchiffreur
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    
    // Déchiffrement du token
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Erreur lors du déchiffrement du token:", error);
    throw new Error("Échec du déchiffrement");
  }
}

// Fonction pour récupérer un token stocké et le déchiffrer
async function getStoredToken(userId: string, provider = 'google') {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at, metadata')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();
  
  if (error) {
    console.error("Erreur lors de la récupération du token:", error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  try {
    // Déchiffrement des tokens avant de les renvoyer
    return {
      ...data,
      access_token: data.access_token ? decryptToken(data.access_token) : null,
      refresh_token: data.refresh_token ? decryptToken(data.refresh_token) : null,
    };
  } catch (error) {
    console.error("Erreur lors du déchiffrement des tokens stockés:", error);
    throw new Error("Impossible de déchiffrer les tokens stockés");
  }
}

// Fonction pour stocker un token en le chiffrant
async function storeToken(
  userId: string, 
  accessToken: string, 
  refreshToken: string | null, 
  expiresIn: number, 
  userInfo: any,
  provider = 'google'
) {
  try {
    // Chiffrement des tokens avant stockage
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;
    
    // Calcul de la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    
    const { data, error } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: provider,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          updated_at: new Date().toISOString()
        }
      }, { onConflict: 'user_id,provider' });
    
    if (error) {
      console.error("Erreur lors du stockage du token:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors du chiffrement et stockage des tokens:", error);
    throw new Error("Impossible de stocker les tokens chiffrés");
  }
}

// Fonction principale pour échanger le code d'autorisation contre des tokens d'accès
async function exchangeCodeForTokens(code: string, redirectUrl: string) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code: code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: redirectUrl,
    grant_type: 'authorization_code'
  });
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors de l'échange du code:", data);
      throw new Error(`Erreur Google OAuth: ${data.error_description || data.error || 'Erreur inconnue'}`);
    }
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      id_token: data.id_token
    };
  } catch (error) {
    console.error("Erreur lors de l'échange du code OAuth:", error);
    throw error;
  }
}

// Fonction pour récupérer les informations de l'utilisateur Google
async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur Google API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des informations utilisateur:", error);
    throw error;
  }
}

// Fonction pour rafraîchir un token expiré
async function refreshAccessToken(userId: string, refreshToken: string) {
  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors du rafraîchissement du token:", data);
      throw new Error(`Erreur Google OAuth: ${data.error_description || data.error || 'Erreur inconnue'}`);
    }
    
    // Récupérer les métadonnées actuelles
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('metadata')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();
    
    // Chiffrement du nouveau token d'accès
    const encryptedAccessToken = encryptToken(data.access_token);
    
    // Calcul de la nouvelle date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    
    // Mise à jour dans la base de données
    const { error } = await supabase
      .from('oauth_tokens')
      .update({
        access_token: encryptedAccessToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (error) {
      console.error("Erreur lors de la mise à jour du token rafraîchi:", error);
      throw error;
    }
    
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    throw error;
  }
}

// Fonction pour révoquer un token
async function revokeToken(userId: string) {
  try {
    // D'abord, récupérer et déchiffrer le token
    const tokenData = await getStoredToken(userId);
    
    if (!tokenData || !tokenData.access_token) {
      console.error("Aucun token à révoquer pour l'utilisateur:", userId);
      return { success: false, error: "Aucun token trouvé" };
    }
    
    // Révoquer le token auprès de Google
    const revokeUrl = 'https://oauth2.googleapis.com/revoke';
    const params = new URLSearchParams({
      token: tokenData.access_token
    });
    
    const response = await fetch(revokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    // Même si la révocation échoue côté Google, nous supprimons l'entrée de notre base de données
    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (error) {
      console.error("Erreur lors de la suppression du token:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
    throw error;
  }
}

// Fonction pour vérifier l'état d'un token
async function checkTokenStatus(userId: string) {
  try {
    const tokenData = await getStoredToken(userId);
    
    if (!tokenData || !tokenData.access_token) {
      return { isValid: false };
    }
    
    // Vérifier si le token est expiré
    const currentTime = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (currentTime >= expiresAt) {
      console.log("Token expiré pour l'utilisateur:", userId);
      
      // Si nous avons un refresh_token, nous pourrions le rafraîchir automatiquement ici
      if (tokenData.refresh_token) {
        try {
          await refreshAccessToken(userId, tokenData.refresh_token);
          console.log("Token rafraîchi automatiquement");
          return { isValid: true };
        } catch (refreshError) {
          console.error("Échec du rafraîchissement automatique:", refreshError);
          return { isValid: false, error: "Token expiré et rafraîchissement échoué" };
        }
      }
      
      return { isValid: false, error: "Token expiré" };
    }
    
    // Calculer le temps restant avant expiration (en secondes)
    const expiresIn = Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000);
    
    return { 
      isValid: true, 
      expiresIn: expiresIn 
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut du token:", error);
    return { isValid: false, error: "Erreur de vérification" };
  }
}

// Point d'entrée principal de l'Edge Function
Deno.serve(async (req) => {
  // Gestion des requêtes CORS préliminaires
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Récupération et analyse du corps de la requête
    const requestData = await req.json();
    
    // Gestion des différentes actions
    if (requestData.action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: googleClientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'revoke_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await revokeToken(userId);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'check_token_status') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const status = await checkTokenStatus(userId);
      
      return new Response(
        JSON.stringify(status),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'refresh_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Récupérer le token actuel (déjà déchiffré par getStoredToken)
      const tokenData = await getStoredToken(userId);
      
      if (!tokenData || !tokenData.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Aucun refresh token disponible" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const refreshResult = await refreshAccessToken(userId, tokenData.refresh_token);
      
      return new Response(
        JSON.stringify({ success: true, ...refreshResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'get_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const tokenData = await getStoredToken(userId);
      
      if (!tokenData || !tokenData.access_token) {
        return new Response(
          JSON.stringify({ error: "Aucun token disponible" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ access_token: tokenData.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Traitement par défaut: échange du code d'autorisation
    const { code, redirectUrl, state } = requestData;
    
    if (!code || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Code d'autorisation et URL de redirection requis" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Échange du code contre des tokens
    const tokens = await exchangeCodeForTokens(code, redirectUrl);
    
    // Récupération des informations de l'utilisateur
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    
    // Récupération de l'ID utilisateur à partir du token JWT
    const authHeader = req.headers.get('Authorization');
    let userId;
    
    if (authHeader) {
      // Si l'utilisateur est authentifié, utiliser son ID
      const jwt = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(jwt);
      userId = user?.id;
    } else {
      // Sinon, rechercher l'utilisateur par email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', userInfo.email)
        .single();
      
      if (userError) {
        console.error("Erreur lors de la recherche de l'utilisateur:", userError);
        return new Response(
          JSON.stringify({ error: "Utilisateur non trouvé" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = userData.id;
    }
    
    // Stockage des tokens chiffrés
    await storeToken(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      userInfo
    );
    
    // Réponse finale avec les informations utilisateur (mais pas les tokens)
    return new Response(
      JSON.stringify({
        success: true,
        user_info: userInfo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erreur dans l'Edge Function Google OAuth:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Une erreur s'est produite lors de l'authentification Google Drive"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
