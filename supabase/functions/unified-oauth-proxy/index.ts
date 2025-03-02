
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import * as crypto from "https://deno.land/std@0.170.0/crypto/mod.ts";
import { encodeBase64 } from "https://deno.land/std@0.170.0/encoding/base64.ts";

// Configuration des clients Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Clé de chiffrement pour les tokens OAuth
const ENCRYPTION_KEY = Deno.env.get("OAUTH_ENCRYPTION_KEY") || "";

// Fonction pour chiffrer les données sensibles
async function encryptData(data: string): Promise<string> {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error("Clé de chiffrement invalide ou manquante (doit être de 32 caractères)");
    throw new Error("Configuration de chiffrement invalide");
  }

  try {
    // Génération d'un vecteur d'initialisation (IV) aléatoire
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Conversion de la clé de chiffrement en format utilisable
    const keyData = new TextEncoder().encode(ENCRYPTION_KEY);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "AES-CBC" }, false, ["encrypt"]
    );
    
    // Chiffrement des données
    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv }, cryptoKey, encodedData
    );
    
    // Concaténation de l'IV et des données chiffrées pour le stockage
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    // Encodage en base64 pour stockage
    return encodeBase64(result);
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    throw new Error("Échec du chiffrement");
  }
}

// Fonction pour déchiffrer les données sensibles
async function decryptData(encryptedDataB64: string): Promise<string> {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error("Clé de chiffrement invalide ou manquante (doit être de 32 caractères)");
    throw new Error("Configuration de chiffrement invalide");
  }

  try {
    // Décodage du base64
    const data = new Uint8Array(atob(encryptedDataB64).split("").map(c => c.charCodeAt(0)));
    
    // Extraction de l'IV (les 16 premiers octets)
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);
    
    // Importation de la clé de chiffrement
    const keyData = new TextEncoder().encode(ENCRYPTION_KEY);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "AES-CBC" }, false, ["decrypt"]
    );
    
    // Déchiffrement des données
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv }, cryptoKey, encryptedData
    );
    
    // Conversion en chaîne de caractères
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    throw new Error("Échec du déchiffrement");
  }
}

// Fonction principale pour gérer les requêtes
serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // === Traitement des requêtes Google OAuth ===
    if (path === "unified-oauth-proxy" && url.searchParams.get("service") === "google") {
      // Extraction des paramètres de la requête
      const body = await req.json();
      
      // Récupération du code d'autorisation envoyé par Google après consentement
      if (body.code) {
        return await handleGoogleOAuthCode(body);
      }
      
      // Action demandée pour la gestion des tokens et clients OAuth
      if (body.action) {
        switch(body.action) {
          case "get_client_id":
            return await getGoogleClientId(body);
          case "refresh_token":
            return await refreshGoogleToken(body);
          case "revoke_token":
            return await revokeGoogleToken(body);
          case "check_token_status":
            return await checkGoogleTokenStatus(body);
          default:
            return new Response(
              JSON.stringify({ error: "Action non reconnue" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }
      }
    }
    
    // === Traitement des requêtes API Proxy sécurisées ===
    else if (path === "unified-oauth-proxy" && url.searchParams.get("service") === "proxy") {
      const { target, method, headers: customHeaders, body: requestBody } = await req.json();
      
      if (!target) {
        return new Response(
          JSON.stringify({ error: "URL cible manquante" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      return await proxyApiRequest(target, method || "GET", customHeaders || {}, requestBody);
    }
    
    // Requête non reconnue
    else {
      return new Response(
        JSON.stringify({ error: "Endpoint non reconnu" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur dans unified-oauth-proxy:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Gestion du code d'autorisation Google OAuth
async function handleGoogleOAuthCode(body: any) {
  const { code, redirectUrl, state } = body;
  
  if (!code || !redirectUrl) {
    return new Response(
      JSON.stringify({ error: "Paramètres manquants" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  try {
    // Récupération des secrets OAuth
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("Identifiants OAuth manquants");
    }
    
    // Échange du code contre un token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
        grant_type: "authorization_code"
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Erreur d'échange de code OAuth:", tokenData);
      throw new Error(`Erreur d'authentification: ${tokenData.error}`);
    }
    
    // Récupération des informations utilisateur
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    
    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      throw new Error("Impossible de récupérer les informations utilisateur");
    }
    
    // Récupération de la session utilisateur
    const { data: authData } = await supabase.auth.getUser(req.headers.get("Authorization")?.split(" ")[1] || "");
    const userId = authData?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }
    
    // Chiffrement des tokens sensibles
    const encryptedAccessToken = await encryptData(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token ? 
      await encryptData(tokenData.refresh_token) : null;
    
    // Calcul de la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    // Enregistrement des tokens dans la base de données
    const { error: tokenError } = await supabase
      .from("oauth_tokens")
      .upsert({
        user_id: userId,
        provider: "google",
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt.toISOString(),
        provider_user_id: userData.id,
        provider_user_email: userData.email,
        metadata: {
          name: userData.name,
          picture: userData.picture,
          hd: userData.hd // Domaine Google Workspace si disponible
        }
      }, { onConflict: "user_id,provider" });
    
    if (tokenError) {
      console.error("Erreur d'enregistrement des tokens:", tokenError);
      throw new Error("Impossible d'enregistrer les informations d'authentification");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user_info: {
          email: userData.email,
          name: userData.name,
          picture: userData.picture
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de l'échange du code OAuth:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Récupération de l'ID client Google OAuth
async function getGoogleClientId(body: any) {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  
  if (!clientId) {
    return new Response(
      JSON.stringify({ error: "Client ID non configuré" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
  
  return new Response(
    JSON.stringify({ client_id: clientId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Rafraîchissement d'un token Google
async function refreshGoogleToken(body: any) {
  const { userId } = body;
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "ID utilisateur manquant" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  try {
    // Récupération du token de rafraîchissement
    const { data: tokenData, error: tokenError } = await supabase
      .from("oauth_tokens")
      .select("refresh_token")
      .eq("user_id", userId)
      .eq("provider", "google")
      .single();
    
    if (tokenError || !tokenData?.refresh_token) {
      throw new Error("Token de rafraîchissement non trouvé");
    }
    
    // Déchiffrement du token
    const refreshToken = await decryptData(tokenData.refresh_token);
    
    // Récupération des secrets OAuth
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("Identifiants OAuth manquants");
    }
    
    // Envoi de la demande de rafraîchissement
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });
    
    const newTokenData = await response.json();
    
    if (!response.ok) {
      console.error("Erreur de rafraîchissement du token:", newTokenData);
      throw new Error(`Erreur de rafraîchissement: ${newTokenData.error}`);
    }
    
    // Chiffrement du nouveau token
    const encryptedAccessToken = await encryptData(newTokenData.access_token);
    
    // Calcul de la nouvelle date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + newTokenData.expires_in);
    
    // Mise à jour du token dans la base de données
    const { error: updateError } = await supabase
      .from("oauth_tokens")
      .update({
        access_token: encryptedAccessToken,
        expires_at: expiresAt.toISOString()
      })
      .eq("user_id", userId)
      .eq("provider", "google");
    
    if (updateError) {
      console.error("Erreur de mise à jour du token:", updateError);
      throw new Error("Impossible de mettre à jour le token");
    }
    
    return new Response(
      JSON.stringify({ success: true, expires_in: newTokenData.expires_in }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Révocation d'un token Google
async function revokeGoogleToken(body: any) {
  const { userId } = body;
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "ID utilisateur manquant" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  try {
    // Récupération du token d'accès
    const { data: tokenData, error: tokenError } = await supabase
      .from("oauth_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .eq("provider", "google")
      .single();
    
    if (tokenError || !tokenData?.access_token) {
      // Si le token n'existe pas, nous considérons la révocation comme réussie
      console.log("Aucun token à révoquer trouvé pour l'utilisateur", userId);
      return new Response(
        JSON.stringify({ success: true, message: "Aucun token à révoquer" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Déchiffrement du token
    const accessToken = await decryptData(tokenData.access_token);
    
    // Révocation du token auprès de Google
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    // Même si la révocation échoue, nous supprimons le token local
    const { error: deleteError } = await supabase
      .from("oauth_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google");
    
    if (deleteError) {
      console.error("Erreur lors de la suppression du token:", deleteError);
      throw new Error("Impossible de supprimer les informations d'accès locales");
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Vérification du statut d'un token Google
async function checkGoogleTokenStatus(body: any) {
  const { userId } = body;
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "ID utilisateur manquant" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
  
  try {
    // Récupération des informations de token
    const { data: tokenData, error: tokenError } = await supabase
      .from("oauth_tokens")
      .select("access_token, expires_at")
      .eq("user_id", userId)
      .eq("provider", "google")
      .single();
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ isValid: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Vérification de la validité du token basée sur la date d'expiration
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    const isValid = expiresAt > now;
    
    // Calcul du temps restant avant expiration (en secondes)
    const expiresIn = isValid ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000) : 0;
    
    return new Response(
      JSON.stringify({ isValid, expiresIn }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return new Response(
      JSON.stringify({ error: error.message, isValid: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Fonction de proxy API sécurisé
async function proxyApiRequest(targetUrl: string, method: string, headers: Record<string, string>, body?: any) {
  try {
    // Validation de l'URL cible
    if (!targetUrl.startsWith("https://")) {
      return new Response(
        JSON.stringify({ error: "Seules les URLs HTTPS sont autorisées" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Configuration de la requête
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };
    
    // Ajout du corps pour les méthodes non-GET
    if (method !== "GET" && body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Exécution de la requête proxifiée
    const response = await fetch(targetUrl, requestOptions);
    
    // Récupération du corps de la réponse
    let responseData;
    const contentType = response.headers.get("Content-Type") || "";
    
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else if (contentType.includes("text/")) {
      responseData = await response.text();
    } else {
      // Pour les données binaires, on retourne un blob base64
      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      responseData = { data: base64, encoding: "base64" };
    }
    
    // Transmission de la réponse au client
    return new Response(
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de la requête proxy:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
