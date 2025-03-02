
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.167.0/crypto/mod.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.167.0/encoding/base64.ts";
import { decode as decodeBase64 } from "https://deno.land/std@0.167.0/encoding/base64.ts";

// Headers CORS pour les requêtes cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialisation du client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const encryptionKey = Deno.env.get('OAUTH_ENCRYPTION_KEY') ?? ''

if (!encryptionKey) {
  console.error("ERREUR: Clé de chiffrement OAUTH_ENCRYPTION_KEY non configurée!")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Fonctions de chiffrement utilisant AES-256-CBC
async function encrypt(text: string): Promise<string> {
  try {
    if (!encryptionKey) throw new Error("Clé de chiffrement non configurée");
    
    // Création d'un vecteur d'initialisation aléatoire
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Conversion de la clé en ArrayBuffer utilisable
    const keyData = new TextEncoder().encode(encryptionKey.slice(0, 32).padEnd(32, '0'));
    
    // Importation de la clé pour l'algorithme AES-CBC
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    
    // Chiffrement des données
    const data = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      data
    );
    
    // Encodage en base64 du résultat (IV + données chiffrées)
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);
    
    return encodeBase64(result);
  } catch (error) {
    console.error("Erreur de chiffrement:", error);
    throw new Error(`Erreur de chiffrement: ${error.message}`);
  }
}

async function decrypt(encryptedBase64: string): Promise<string> {
  try {
    if (!encryptionKey) throw new Error("Clé de chiffrement non configurée");
    
    // Décodage de la chaîne base64
    const encryptedWithIv = decodeBase64(encryptedBase64);
    
    // Extraction de l'IV (les 16 premiers octets)
    const iv = encryptedWithIv.slice(0, 16);
    
    // Extraction des données chiffrées
    const encryptedData = encryptedWithIv.slice(16);
    
    // Conversion de la clé en ArrayBuffer utilisable
    const keyData = new TextEncoder().encode(encryptionKey.slice(0, 32).padEnd(32, '0'));
    
    // Importation de la clé pour l'algorithme AES-CBC
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    
    // Déchiffrement des données
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      encryptedData
    );
    
    // Conversion en chaîne de caractères
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Erreur de déchiffrement:", error);
    throw new Error(`Erreur de déchiffrement: ${error.message}`);
  }
}

// Fonction pour sauvegarder un token OAuth chiffré
async function saveEncryptedOAuthToken(userId: string, provider: string, token: any) {
  try {
    // Chiffrement des tokens sensibles
    const encryptedAccessToken = await encrypt(token.access_token);
    let encryptedRefreshToken = null;
    if (token.refresh_token) {
      encryptedRefreshToken = await encrypt(token.refresh_token);
    }
    
    // Préparation des données pour la base de données
    const tokenData = {
      user_id: userId,
      provider: provider,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: token.expires_at ? new Date(token.expires_at) : null,
      metadata: token.metadata || {}
    };
    
    // Vérification si un token existe déjà
    const { data: existingToken } = await supabase
      .from('oauth_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
      
    if (existingToken) {
      // Mise à jour du token existant
      const { error } = await supabase
        .from('oauth_tokens')
        .update(tokenData)
        .eq('id', existingToken.id);
        
      if (error) throw error;
      console.log(`Token OAuth mis à jour pour l'utilisateur ${userId} (${provider})`);
    } else {
      // Création d'un nouveau token
      const { error } = await supabase
        .from('oauth_tokens')
        .insert(tokenData);
        
      if (error) throw error;
      console.log(`Nouveau token OAuth enregistré pour l'utilisateur ${userId} (${provider})`);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du token chiffré:", error);
    throw error;
  }
}

// Fonction pour récupérer et déchiffrer un token OAuth
async function getDecryptedOAuthToken(userId: string, provider: string) {
  try {
    const { data: token, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
      
    if (error) throw error;
    if (!token) return null;
    
    // Déchiffrement des tokens
    const decryptedAccessToken = await decrypt(token.access_token);
    let decryptedRefreshToken = null;
    if (token.refresh_token) {
      decryptedRefreshToken = await decrypt(token.refresh_token);
    }
    
    return {
      ...token,
      access_token: decryptedAccessToken,
      refresh_token: decryptedRefreshToken
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du token déchiffré:", error);
    throw error;
  }
}

// Fonction pour révoquer un token OAuth
async function revokeOAuthToken(userId: string, provider: string) {
  try {
    // Récupération du token chiffré
    const token = await getDecryptedOAuthToken(userId, provider);
    if (!token) {
      console.warn(`Aucun token à révoquer pour l'utilisateur ${userId} (${provider})`);
      return false;
    }
    
    // Pour Google: révocation du token via l'API Google
    if (provider === 'google') {
      const response = await fetch(
        `https://accounts.google.com/o/oauth2/revoke?token=${token.access_token}`,
        { method: 'POST' }
      );
      
      if (!response.ok && response.status !== 400) {
        // 400 peut arriver si le token est déjà expiré
        console.warn(`Erreur lors de la révocation du token Google: ${response.status}`);
      }
    }
    
    // Suppression du token de la base de données
    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);
      
    if (error) throw error;
    
    console.log(`Token OAuth révoqué pour l'utilisateur ${userId} (${provider})`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
    throw error;
  }
}

// Fonction pour vérifier et rafraîchir un token OAuth
async function checkAndRefreshToken(userId: string, provider: string) {
  try {
    // Récupération du token chiffré
    const token = await getDecryptedOAuthToken(userId, provider);
    if (!token) {
      return { isValid: false, message: "Aucun token trouvé" };
    }
    
    // Vérification de l'expiration
    const now = new Date();
    const expiresAt = new Date(token.expires_at);
    const isExpired = expiresAt <= now;
    
    if (!isExpired) {
      // Calcul du temps restant en secondes
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      return { 
        isValid: true, 
        expiresIn: expiresIn
      };
    } else if (token.refresh_token) {
      // Token expiré mais refresh_token disponible
      console.log(`Token expiré pour l'utilisateur ${userId}, tentative de rafraîchissement...`);
      return await refreshOAuthToken(userId, provider, token.refresh_token);
    } else {
      // Token expiré sans possibilité de rafraîchissement
      return { 
        isValid: false, 
        message: "Token expiré et pas de refresh_token"
      };
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return { 
      isValid: false, 
      message: `Erreur: ${error.message}` 
    };
  }
}

// Fonction pour rafraîchir un token OAuth
async function refreshOAuthToken(userId: string, provider: string, refreshToken: string) {
  try {
    if (provider !== 'google') {
      throw new Error(`Rafraîchissement de token non implémenté pour le provider: ${provider}`);
    }
    
    // Récupération des identifiants client
    const { data: clientConfig, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();
      
    if (configError || !clientConfig) {
      throw new Error("Configuration OAuth introuvable");
    }
    
    const clientId = clientConfig.config.client_id;
    const clientSecret = clientConfig.config.client_secret;
    
    if (!clientId || !clientSecret) {
      throw new Error("Configuration OAuth incomplète");
    }
    
    // Appel à l'API Google pour rafraîchir le token
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors du rafraîchissement du token:", data);
      return { 
        isValid: false, 
        message: `Erreur lors du rafraîchissement: ${data.error}`
      };
    }
    
    // Calcul de la nouvelle date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    
    // Récupération des métadonnées existantes
    const { data: existingToken } = await supabase
      .from('oauth_tokens')
      .select('metadata')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
      
    // Préparation du nouveau token
    const newToken = {
      access_token: data.access_token,
      refresh_token: refreshToken, // On garde le même refresh_token
      expires_at: expiresAt.toISOString(),
      metadata: existingToken?.metadata || {}
    };
    
    // Sauvegarde du nouveau token
    await saveEncryptedOAuthToken(userId, provider, newToken);
    
    console.log(`Token rafraîchi avec succès pour l'utilisateur ${userId}`);
    return { 
      isValid: true, 
      success: true, 
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return { 
      isValid: false, 
      message: `Erreur: ${error.message}`
    };
  }
}

// Gestion des requêtes HTTP
serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extraction du corps de la requête
    const requestData = await req.json();
    
    // Récupération d'un client_id (connexion initiale)
    if (requestData.action === 'get_client_id') {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .single();
        
      if (error || !data) {
        throw new Error("Configuration OAuth Google introuvable");
      }
      
      return new Response(
        JSON.stringify({ client_id: data.config.client_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Échange de code d'autorisation contre des tokens
    else if (requestData.code && requestData.redirectUrl) {
      console.log("Échange de code d'autorisation contre des tokens");
      
      // Vérification des paramètres requis
      if (!requestData.code || !requestData.redirectUrl) {
        throw new Error("Paramètres manquants: code ou redirectUrl");
      }
      
      // Récupération de la configuration OAuth
      const { data: clientConfig, error: configError } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .single();
        
      if (configError || !clientConfig) {
        throw new Error("Configuration OAuth introuvable");
      }
      
      const clientId = clientConfig.config.client_id;
      const clientSecret = clientConfig.config.client_secret;
      
      if (!clientId || !clientSecret) {
        throw new Error("Configuration OAuth incomplète");
      }
      
      // Échange du code contre des tokens
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('code', requestData.code);
      params.append('redirect_uri', requestData.redirectUrl);
      params.append('grant_type', 'authorization_code');
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("Erreur lors de l'échange du code:", tokenData);
        throw new Error(`Erreur lors de l'échange du code: ${tokenData.error}`);
      }
      
      // Récupération des informations utilisateur
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      const userInfo = await userInfoResponse.json();
      
      if (!userInfoResponse.ok) {
        console.error("Erreur lors de la récupération des infos utilisateur:", userInfo);
        throw new Error("Impossible de récupérer les informations utilisateur");
      }
      
      // Recherche de l'utilisateur Supabase correspondant
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Erreur d'authentification");
      }
      
      const userId = userData.user.id;
      
      // Calcul de la date d'expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
      
      // Préparation des données de token à sauvegarder
      const oauthTokenData = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        metadata: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        }
      };
      
      // Sauvegarde des tokens chiffrés
      await saveEncryptedOAuthToken(userId, 'google', oauthTokenData);
      
      return new Response(
        JSON.stringify({
          success: true,
          user_info: userInfo
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérification du statut d'un token
    else if (requestData.action === 'check_token_status' && requestData.userId) {
      console.log(`Vérification du statut du token pour l'utilisateur ${requestData.userId}`);
      const status = await checkAndRefreshToken(requestData.userId, 'google');
      
      return new Response(
        JSON.stringify(status),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Rafraîchissement d'un token
    else if (requestData.action === 'refresh_token' && requestData.userId) {
      console.log(`Rafraîchissement du token pour l'utilisateur ${requestData.userId}`);
      const token = await getDecryptedOAuthToken(requestData.userId, 'google');
      
      if (!token || !token.refresh_token) {
        return new Response(
          JSON.stringify({ success: false, error: "Aucun refresh_token disponible" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await refreshOAuthToken(requestData.userId, 'google', token.refresh_token);
      
      return new Response(
        JSON.stringify({ success: result.isValid, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Révocation d'un token
    else if (requestData.action === 'revoke_token' && requestData.userId) {
      console.log(`Révocation du token pour l'utilisateur ${requestData.userId}`);
      const success = await revokeOAuthToken(requestData.userId, 'google');
      
      return new Response(
        JSON.stringify({ success }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action non reconnue
    else {
      throw new Error("Action non reconnue ou paramètres manquants");
    }
  } catch (error) {
    console.error("Erreur:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
