
import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Configuration des en-têtes CORS pour permettre les appels depuis le frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  code?: string;
  action?: string;
  redirectUrl?: string;
  userId?: string;
  tenantId?: string;
  state?: string;
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestBody: OAuthRequest = await req.json();
    const { code, action, redirectUrl, userId, tenantId, state } = requestBody;

    // Récupération des identifiants client depuis la table service_configurations
    const { data: serviceConfig, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'MICROSOFT_OAUTH')
      .single();

    if (configError || !serviceConfig?.config) {
      console.error("Erreur lors de la récupération de la configuration OAuth:", configError);
      return new Response(
        JSON.stringify({ error: "Configuration OAuth non trouvée" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const clientId = serviceConfig.config.client_id;
    const clientSecret = serviceConfig.config.client_secret;

    // Traitement en fonction de l'action demandée
    switch (action) {
      case 'get_client_id':
        return new Response(
          JSON.stringify({ client_id: clientId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'revoke_token':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "ID utilisateur requis pour révoquer le token" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Pour Microsoft, il n'y a pas d'endpoint de révocation standard
        // On supprime simplement les tokens de la base de données
        await supabase
          .from('oauth_tokens')
          .delete()
          .eq('user_id', userId)
          .eq('provider', 'microsoft');

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'check_token_status':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "ID utilisateur requis pour vérifier le statut du token" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { data: tokenStatus, error: statusError } = await supabase
          .from('oauth_tokens')
          .select('expires_at, access_token')
          .eq('user_id', userId)
          .eq('provider', 'microsoft')
          .single();

        if (statusError || !tokenStatus) {
          return new Response(
            JSON.stringify({ isValid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const expiresAt = new Date(tokenStatus.expires_at);
        const now = new Date();
        const isValid = expiresAt > now;
        const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

        return new Response(
          JSON.stringify({ isValid, expiresIn }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'refresh_token':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "ID utilisateur requis pour rafraîchir le token" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { data: refreshData, error: refreshError } = await supabase
          .from('oauth_tokens')
          .select('refresh_token')
          .eq('user_id', userId)
          .eq('provider', 'microsoft')
          .single();

        if (refreshError || !refreshData?.refresh_token) {
          return new Response(
            JSON.stringify({ error: "Token de rafraîchissement non trouvé" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Nous avons besoin du tenant ID pour Microsoft
        const currentTenantId = tenantId || 'common';

        // Rafraîchissement du token
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${currentTenantId}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshData.refresh_token,
            grant_type: 'refresh_token'
          })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.error("Erreur lors du rafraîchissement du token:", tokenData);
          return new Response(
            JSON.stringify({ error: "Échec du rafraîchissement du token", details: tokenData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Calcul de la date d'expiration
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + tokenData.expires_in);

        // Mise à jour du token dans la BD
        const { error: updateError } = await supabase
          .from('oauth_tokens')
          .update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token, // Microsoft retourne un nouveau refresh token
            expires_at: expiryDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('provider', 'microsoft');

        if (updateError) {
          console.error("Erreur lors de la mise à jour du token:", updateError);
          return new Response(
            JSON.stringify({ error: "Échec de la mise à jour du token en BD" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        // Traitement du code d'authentification (comportement par défaut)
        if (!code || !redirectUrl) {
          return new Response(
            JSON.stringify({ error: "Code d'autorisation et URL de redirection requis" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Vérification de l'état si fourni
        if (!state) {
          console.warn("État OAuth non fourni dans la requête");
        }

        // Nous avons besoin du tenant ID pour Microsoft
        const authTenantId = tenantId || 'common';

        // Échange du code contre des tokens
        const tokenUrl = `https://login.microsoftonline.com/${authTenantId}/oauth2/v2.0/token`;
        const tokenReq = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUrl,
            grant_type: 'authorization_code'
          })
        });

        const tokenResult = await tokenReq.json();

        if (!tokenReq.ok) {
          console.error("Erreur lors de l'échange du code:", tokenResult);
          return new Response(
            JSON.stringify({ error: "Échec de l'échange du code d'autorisation", details: tokenResult }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Récupération des informations utilisateur
        const userInfoReq = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${tokenResult.access_token}` }
        });

        const userInfo = await userInfoReq.json();

        if (!userInfoReq.ok) {
          console.error("Erreur lors de la récupération des informations utilisateur:", userInfo);
          return new Response(
            JSON.stringify({ error: "Échec de la récupération des informations utilisateur" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Récupération de l'utilisateur Supabase actuel
        const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '');

        if (!user) {
          return new Response(
            JSON.stringify({ error: "Utilisateur non authentifié" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          );
        }

        // Calcul de la date d'expiration
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenResult.expires_in);

        // Stockage des tokens dans Supabase
        const { error: insertError } = await supabase
          .from('oauth_tokens')
          .upsert({
            user_id: user.id,
            provider: 'microsoft',
            access_token: tokenResult.access_token,
            refresh_token: tokenResult.refresh_token,
            expires_at: expiresAt.toISOString(),
            provider_user_id: userInfo.id,
            provider_user_email: userInfo.userPrincipalName || userInfo.mail,
            provider_user_info: userInfo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,provider' });

        if (insertError) {
          console.error("Erreur lors du stockage des tokens:", insertError);
          return new Response(
            JSON.stringify({ error: "Échec du stockage des tokens" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            user_info: {
              id: userInfo.id,
              email: userInfo.userPrincipalName || userInfo.mail,
              name: userInfo.displayName,
              picture: null // Microsoft ne fournit pas directement une URL d'avatar
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error("Erreur lors du traitement de la requête OAuth Microsoft:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
