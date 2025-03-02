
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Création du client Supabase avec la clé de service pour les opérations d'administration
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Gestion des requêtes CORS OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extraction du corps de la requête
    const { provider, action, userId, redirectUrl, tenantId, code } = await req.json();

    // Validation des paramètres d'entrée
    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action manquante" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Vérification du fournisseur (Google ou Microsoft)
    if (provider !== "google" && provider !== "microsoft") {
      return new Response(
        JSON.stringify({ error: "Fournisseur non supporté. Utilisez 'google' ou 'microsoft'" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Traitement de l'action "${action}" pour le fournisseur "${provider}"`);

    // Actions communes aux deux fournisseurs
    if (action === "get_client_id") {
      // Récupération de l'ID client selon le fournisseur
      let clientId;
      if (provider === "google") {
        clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
      } else {
        clientId = Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID");
      }

      if (!clientId) {
        return new Response(
          JSON.stringify({ error: `ID client ${provider} non configuré` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ client_id: clientId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérification de l'utilisateur pour les actions qui en ont besoin
    if (["exchange_code", "refresh_token", "revoke_token", "check_token_status"].includes(action) && !userId) {
      return new Response(
        JSON.stringify({ error: "ID utilisateur requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Traitement spécifique à Google
    if (provider === "google") {
      return await handleGoogleOAuth(action, userId, redirectUrl, code);
    } 
    // Traitement spécifique à Microsoft
    else {
      return await handleMicrosoftOAuth(action, userId, redirectUrl, tenantId, code);
    }
  } catch (error) {
    console.error(`Erreur dans la fonction unified-oauth:`, error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Fonction de gestion des actions OAuth de Google
async function handleGoogleOAuth(action: string, userId?: string, redirectUrl?: string, code?: string) {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: "Configuration Google OAuth manquante" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  if (action === "exchange_code") {
    if (!code || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Code d'autorisation et URL de redirection requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    try {
      // Échange du code contre un token OAuth
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUrl,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Erreur lors de l'échange du code Google:", errorData);
        return new Response(
          JSON.stringify({ error: "Échec de l'échange du code d'autorisation", details: errorData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const tokenData = await tokenResponse.json();

      // Récupération des informations de l'utilisateur Google
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error("Erreur lors de la récupération des infos utilisateur Google");
        return new Response(
          JSON.stringify({ error: "Échec de la récupération des informations utilisateur" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const userInfo = await userInfoResponse.json();

      // Stockage du token dans la base de données
      const { error: insertError } = await supabaseAdmin
        .from("oauth_tokens")
        .upsert({
          user_id: userId,
          provider: "google",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          metadata: {
            scope: tokenData.scope,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            token_type: tokenData.token_type
          },
        });

      if (insertError) {
        console.error("Erreur d'insertion du token Google:", insertError);
        return new Response(
          JSON.stringify({ error: "Échec de l'enregistrement du token", details: insertError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans l'échange de code Google:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'échange de code", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "refresh_token") {
    try {
      // Récupération du refresh token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("refresh_token")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (tokenError || !tokenData?.refresh_token) {
        console.error("Erreur de récupération du refresh token Google:", tokenError);
        return new Response(
          JSON.stringify({ error: "Token de rafraîchissement introuvable", details: tokenError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Utilisation du refresh token pour obtenir un nouveau access token
      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.text();
        console.error("Erreur lors du rafraîchissement du token Google:", errorData);
        return new Response(
          JSON.stringify({ error: "Échec du rafraîchissement du token", details: errorData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const newTokenData = await refreshResponse.json();

      // Mise à jour du token en base de données
      const { error: updateError } = await supabaseAdmin
        .from("oauth_tokens")
        .update({
          access_token: newTokenData.access_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
          // Conserver le refresh_token existant si aucun nouveau n'est fourni
          ...(newTokenData.refresh_token && { refresh_token: newTokenData.refresh_token }),
        })
        .eq("user_id", userId)
        .eq("provider", "google");

      if (updateError) {
        console.error("Erreur de mise à jour du token Google:", updateError);
        return new Response(
          JSON.stringify({ error: "Échec de la mise à jour du token", details: updateError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans le rafraîchissement du token Google:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors du rafraîchissement du token", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "revoke_token") {
    try {
      // Récupération du token d'accès
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("access_token")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (tokenError) {
        console.error("Erreur de récupération du token Google pour révocation:", tokenError);
        return new Response(
          JSON.stringify({ error: "Token d'accès introuvable", details: tokenError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (tokenData?.access_token) {
        // Révocation du token auprès de Google
        await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      }

      // Suppression du token de la base de données
      const { error: deleteError } = await supabaseAdmin
        .from("oauth_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("provider", "google");

      if (deleteError) {
        console.error("Erreur de suppression du token Google:", deleteError);
        return new Response(
          JSON.stringify({ error: "Échec de la suppression du token", details: deleteError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans la révocation du token Google:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la révocation du token", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "check_token_status") {
    try {
      // Récupération des informations du token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("access_token, expires_at")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (tokenError || !tokenData) {
        console.error("Erreur de récupération du token Google pour vérification:", tokenError);
        return new Response(
          JSON.stringify({ isValid: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const isValid = expiresAt > now;
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      return new Response(
        JSON.stringify({ isValid, expiresIn }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans la vérification du token Google:", error);
      return new Response(
        JSON.stringify({ isValid: false, error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Action non supportée pour Google" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
  );
}

// Fonction de gestion des actions OAuth de Microsoft
async function handleMicrosoftOAuth(action: string, userId?: string, redirectUrl?: string, tenantId?: string, code?: string) {
  const clientId = Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("MICROSOFT_OAUTH_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: "Configuration Microsoft OAuth manquante" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Tenant ID par défaut si non spécifié (common pour multi-tenant)
  const msftTenantId = tenantId || "common";

  if (action === "exchange_code") {
    if (!code || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Code d'autorisation et URL de redirection requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    try {
      // Échange du code contre un token OAuth pour Microsoft
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${msftTenantId}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUrl,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Erreur lors de l'échange du code Microsoft:", errorData);
        return new Response(
          JSON.stringify({ error: "Échec de l'échange du code d'autorisation", details: errorData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const tokenData = await tokenResponse.json();

      // Récupération des informations de l'utilisateur Microsoft
      const userInfoResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error("Erreur lors de la récupération des infos utilisateur Microsoft");
        return new Response(
          JSON.stringify({ error: "Échec de la récupération des informations utilisateur" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const userInfo = await userInfoResponse.json();

      // Stockage du token dans la base de données
      const { error: insertError } = await supabaseAdmin
        .from("oauth_tokens")
        .upsert({
          user_id: userId,
          provider: "microsoft",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          metadata: {
            scope: tokenData.scope,
            email: userInfo.mail || userInfo.userPrincipalName,
            name: userInfo.displayName,
            tenant_id: msftTenantId,
            token_type: tokenData.token_type
          },
        });

      if (insertError) {
        console.error("Erreur d'insertion du token Microsoft:", insertError);
        return new Response(
          JSON.stringify({ error: "Échec de l'enregistrement du token", details: insertError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            email: userInfo.mail || userInfo.userPrincipalName,
            name: userInfo.displayName,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans l'échange de code Microsoft:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'échange de code", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "refresh_token") {
    try {
      // Récupération du refresh token et tenant ID
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("refresh_token, metadata")
        .eq("user_id", userId)
        .eq("provider", "microsoft")
        .single();

      if (tokenError || !tokenData?.refresh_token) {
        console.error("Erreur de récupération du refresh token Microsoft:", tokenError);
        return new Response(
          JSON.stringify({ error: "Token de rafraîchissement introuvable", details: tokenError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Récupération du tenant ID depuis les métadonnées
      const tenant = tokenData.metadata?.tenant_id || msftTenantId;

      // Utilisation du refresh token pour obtenir un nouveau access token
      const refreshResponse = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.text();
        console.error("Erreur lors du rafraîchissement du token Microsoft:", errorData);
        return new Response(
          JSON.stringify({ error: "Échec du rafraîchissement du token", details: errorData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const newTokenData = await refreshResponse.json();

      // Mise à jour du token en base de données
      const { error: updateError } = await supabaseAdmin
        .from("oauth_tokens")
        .update({
          access_token: newTokenData.access_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
          // Conserver le refresh_token existant si aucun nouveau n'est fourni
          ...(newTokenData.refresh_token && { refresh_token: newTokenData.refresh_token }),
        })
        .eq("user_id", userId)
        .eq("provider", "microsoft");

      if (updateError) {
        console.error("Erreur de mise à jour du token Microsoft:", updateError);
        return new Response(
          JSON.stringify({ error: "Échec de la mise à jour du token", details: updateError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans le rafraîchissement du token Microsoft:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors du rafraîchissement du token", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "revoke_token") {
    try {
      // Récupération du token et des métadonnées
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("access_token, metadata")
        .eq("user_id", userId)
        .eq("provider", "microsoft")
        .single();

      if (tokenError) {
        console.error("Erreur de récupération du token Microsoft pour révocation:", tokenError);
      } else if (tokenData?.access_token) {
        // Récupération du tenant ID depuis les métadonnées
        const tenant = tokenData.metadata?.tenant_id || msftTenantId;
        
        // Tentative de révocation du token (Microsoft n'a pas d'endpoint de révocation standard)
        // mais nous pouvons essayer de le rendre invalide en modifiant le mot de passe de l'application
        console.log("Microsoft ne fournit pas d'endpoint de révocation standard. Suppression locale uniquement.");
      }

      // Suppression du token de la base de données
      const { error: deleteError } = await supabaseAdmin
        .from("oauth_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("provider", "microsoft");

      if (deleteError) {
        console.error("Erreur de suppression du token Microsoft:", deleteError);
        return new Response(
          JSON.stringify({ error: "Échec de la suppression du token", details: deleteError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans la révocation du token Microsoft:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la révocation du token", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } else if (action === "check_token_status") {
    try {
      // Récupération des informations du token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("oauth_tokens")
        .select("access_token, expires_at")
        .eq("user_id", userId)
        .eq("provider", "microsoft")
        .single();

      if (tokenError || !tokenData) {
        console.error("Erreur de récupération du token Microsoft pour vérification:", tokenError);
        return new Response(
          JSON.stringify({ isValid: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const isValid = expiresAt > now;
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      return new Response(
        JSON.stringify({ isValid, expiresIn }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Exception dans la vérification du token Microsoft:", error);
      return new Response(
        JSON.stringify({ isValid: false, error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Action non supportée pour Microsoft" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
  );
}
