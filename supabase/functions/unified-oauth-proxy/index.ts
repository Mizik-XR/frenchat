// unified-oauth-proxy.ts - Une fonction unifiée pour gérer l'authentification OAuth et les proxys API sécurisés
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
// Fix the buffer import path
import { Buffer } from 'https://deno.land/std@0.192.0/node/buffer.ts';
import { encode as encodeBase64 } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
import * as crypto from 'https://deno.land/std@0.192.0/crypto/mod.ts';

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialiser le client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Récupérer les secrets OAuth
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
const OAUTH_ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY') || '';

// Vérifier que les secrets requis sont présents
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Erreur de configuration: Secrets OAuth manquants");
}

if (!OAUTH_ENCRYPTION_KEY || OAUTH_ENCRYPTION_KEY.length < 32) {
  console.error("Erreur de configuration: Clé d'encryption manquante ou invalide (doit faire au moins 32 caractères)");
}

// Fonctions de chiffrement/déchiffrement AES-256-CBC
async function encryptData(data: string): Promise<string> {
  if (!OAUTH_ENCRYPTION_KEY) {
    throw new Error("Clé d'encryption non configurée");
  }
  
  try {
    // Générer un vecteur d'initialisation (IV) aléatoire
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Préparer la clé
    const keyData = new TextEncoder().encode(OAUTH_ENCRYPTION_KEY.substring(0, 32));
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "AES-CBC" }, 
      false, 
      ["encrypt"]
    );
    
    // Chiffrer les données
    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      encodedData
    );
    
    // Combiner l'IV et les données chiffrées en un seul buffer
    const encryptedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedBuffer.set(iv, 0);
    encryptedBuffer.set(new Uint8Array(encryptedData), iv.length);
    
    // Convertir en base64 pour stockage
    return encodeBase64(encryptedBuffer);
  } catch (error) {
    console.error("Erreur lors du chiffrement des données:", error);
    throw error;
  }
}

async function decryptData(encryptedBase64: string): Promise<string> {
  if (!OAUTH_ENCRYPTION_KEY) {
    throw new Error("Clé d'encryption non configurée");
  }
  
  try {
    // Décoder de base64 à binaire
    const encryptedBuffer = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extraire l'IV (les 16 premiers octets)
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);
    
    // Préparer la clé
    const keyData = new TextEncoder().encode(OAUTH_ENCRYPTION_KEY.substring(0, 32));
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "AES-CBC" }, 
      false, 
      ["decrypt"]
    );
    
    // Déchiffrer les données
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      encryptedData
    );
    
    // Convertir le résultat en string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Erreur lors du déchiffrement des données:", error);
    throw new Error("Impossible de déchiffrer les données");
  }
}

// Fonction pour gérer les demandes OAuth
async function handleGoogleOAuth(req: Request): Promise<Response> {
  const { code, redirectUrl, state, action, userId } = await req.json();
  
  if (action === 'get_client_id') {
    return new Response(
      JSON.stringify({ client_id: GOOGLE_CLIENT_ID }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Si nous avons reçu un code d'autorisation, l'échangez contre un token
  if (code) {
    try {
      console.log("Échange du code d'autorisation contre un token...");
      
      // Préparer les informations pour l'échange du code
      const basicAuth = Buffer.from(`${GOOGLE_CLIENT_ID}:${GOOGLE_CLIENT_SECRET}`).toString('base64');
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams({
        code,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
      });
      
      // Faire la requête pour obtenir les tokens
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
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
        access_token: await encryptData(tokenData.access_token),
        refresh_token: tokenData.refresh_token ? await encryptData(tokenData.refresh_token) : null,
        id_token: tokenData.id_token ? await encryptData(tokenData.id_token) : null
      };
      
      // Sauvegarder les tokens dans la base de données
      const { data: authUser } = await supabase.auth.getUser(tokenData.id_token);
      const userId = authUser?.user?.id;
      
      if (!userId) {
        console.log("Récupération de l'utilisateur courant depuis le token JWT");
        // Si nous n'avons pas pu obtenir l'utilisateur à partir du token,
        // utilisez le header d'autorisation
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: authData } = await supabase.auth.getUser(token);
          if (authData?.user?.id) {
            // userId = authData.user.id;
          }
        }
      }
      
      // Enregistrer les tokens
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: userId || userInfo.id, // Utiliser l'ID Google si l'ID utilisateur n'est pas disponible
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
      
      return new Response(
        JSON.stringify({ success: true, user_info: userInfo }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Erreur pendant l'authentification Google OAuth:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ isValid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Vérifier si le token est expiré
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const isValid = expiresAt > now;
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      return new Response(
        JSON.stringify({ isValid, expiresIn }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return new Response(
        JSON.stringify({ isValid: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ success: false, error: "Aucun refresh token disponible" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Déchiffrer le refresh token
      const refreshToken = await decryptData(tokenData.refresh_token);
      
      // Préparer les données pour le rafraîchissement
      const basicAuth = Buffer.from(`${GOOGLE_CLIENT_ID}:${GOOGLE_CLIENT_SECRET}`).toString('base64');
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      
      // Faire la requête pour obtenir un nouveau token
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
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
      const encryptedAccessToken = await encryptData(newTokenData.access_token);
      
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
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ success: false, error: "Aucun token à révoquer" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Déchiffrer le token d'accès
      const accessToken = await decryptData(tokenData.access_token);
      
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
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Erreur lors de la révocation du token:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Si aucune action valide n'est spécifiée
  return new Response(
    JSON.stringify({ success: false, error: "Action invalide ou paramètres manquants" }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Fonction principale pour traiter les requêtes
serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { provider = 'google' } = body;
    
    // Router selon le fournisseur
    switch (provider) {
      case 'google':
        return await handleGoogleOAuth(req);
      default:
        return new Response(
          JSON.stringify({ error: `Fournisseur non supporté: ${provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
