
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Création du client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration OAuth
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';

serve(async (req) => {
  // Gestion CORS pour les requêtes préliminaires OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupération des données de la requête
    const { action, code, redirectUrl, userId } = await req.json();

    // Récupérer le client ID uniquement (sécurisé)
    if (action === 'get_client_id') {
      return new Response(JSON.stringify({ client_id: GOOGLE_CLIENT_ID }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Échanger le code contre un token (TOUJOURS côté serveur)
    if (action === 'exchange_code') {
      console.log("Échange du code d'autorisation contre des tokens...");
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Code d'autorisation manquant" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!redirectUrl) {
        return new Response(
          JSON.stringify({ error: "URL de redirection manquante" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error("Erreur lors de l'échange du code:", tokenData);
        return new Response(
          JSON.stringify({ error: tokenData.error_description || tokenData.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer les infos du profil
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Récupérer l'ID utilisateur de la session
      const { data: authData } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '');
      
      const userID = authData?.user?.id;
      if (!userID) {
        return new Response(
          JSON.stringify({ error: "Utilisateur non authentifié" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Stocker les tokens dans la base de données
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: userID,
          provider: 'google',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          metadata: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
        });

      if (tokenError) {
        console.error("Erreur lors du stockage des tokens:", tokenError);
        return new Response(
          JSON.stringify({ error: "Erreur lors du stockage des tokens" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, email: userInfo.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rafraîchir un token expiré
    if (action === 'refresh_token') {
      const { data: tokens, error: fetchError } = await supabase
        .from('oauth_tokens')
        .select('refresh_token')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .single();

      if (fetchError || !tokens?.refresh_token) {
        console.error("Erreur lors de la récupération du refresh token:", fetchError);
        return new Response(
          JSON.stringify({ error: "Token de rafraîchissement introuvable" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();

      if (refreshData.error) {
        console.error("Erreur lors du rafraîchissement du token:", refreshData);
        return new Response(
          JSON.stringify({ error: refreshData.error_description || refreshData.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mettre à jour le token d'accès dans la base de données
      const { error: updateError } = await supabase
        .from('oauth_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider', 'google');

      if (updateError) {
        console.error("Erreur lors de la mise à jour du token:", updateError);
        return new Response(
          JSON.stringify({ error: "Erreur lors de la mise à jour du token" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Révoquer un token
    if (action === 'revoke_token') {
      const { data: tokens, error: fetchError } = await supabase
        .from('oauth_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .single();

      if (fetchError || !tokens?.access_token) {
        console.error("Erreur lors de la récupération du token à révoquer:", fetchError);
        return new Response(
          JSON.stringify({ error: "Token introuvable" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Révoquer le token auprès de Google
      await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Supprimer le token de la base de données (même si la révocation échoue)
      const { error: deleteError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google');

      if (deleteError) {
        console.error("Erreur lors de la suppression du token:", deleteError);
        return new Response(
          JSON.stringify({ error: "Erreur lors de la suppression du token" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Action non reconnue" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erreur dans la fonction google-oauth:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
