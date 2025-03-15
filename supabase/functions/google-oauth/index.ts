
// supabase/functions/google-oauth/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Variables d'environnement
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const googleClientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const googleClientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';

// Initialiser le client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Constantes pour le service Google
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

// Scopes nécessaires pour l'accès à Google Drive
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
].join(' ');

// Handler principal
Deno.serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extraction des données de la requête
    const { action, code, redirectUrl, userId, state } = await req.json();

    console.log(`Traitement de l'action: ${action}`);

    // Gestion des différentes actions
    if (action === 'get_auth_url') {
      return handleGetAuthUrl(redirectUrl, userId);
    } else if (action === 'exchange_code') {
      return handleExchangeCode(code, redirectUrl, userId);
    } else if (action === 'revoke_token') {
      return handleRevokeToken(userId);
    } else if (action === 'check_token_status') {
      return handleCheckTokenStatus(userId);
    } else if (action === 'get_token') {
      return handleGetToken(userId);
    } else if (action === 'refresh_token') {
      return handleRefreshToken(userId);
    } else if (action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: googleClientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action par défaut: échange de code (pour compatibilité)
    if (code && redirectUrl) {
      return handleExchangeCode(code, redirectUrl, userId || state);
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue ou paramètres manquants' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans la fonction Google OAuth:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction pour générer l'URL d'authentification Google
async function handleGetAuthUrl(redirectUrl: string, userId: string) {
  if (!redirectUrl) {
    return new Response(
      JSON.stringify({ error: 'URL de redirection requise' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Générer un état avec l'ID utilisateur pour le récupérer après la redirection
  const state = userId || 'anonymous';

  // Construction de l'URL d'authentification
  const authUrl = `${GOOGLE_AUTH_URL}?` + new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUrl,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: state
  }).toString();

  console.log(`URL d'authentification générée pour l'utilisateur ${userId}: ${authUrl}`);

  return new Response(
    JSON.stringify({ auth_url: authUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Fonction pour échanger le code d'autorisation contre des tokens
async function handleExchangeCode(code: string, redirectUrl: string, userId: string) {
  if (!code || !redirectUrl) {
    return new Response(
      JSON.stringify({ error: 'Code d\'autorisation et URL de redirection requis' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`Échange du code pour l'utilisateur ${userId}`);

    // Échanger le code contre des tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: code,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du code:', tokenData);
      return new Response(
        JSON.stringify({ error: tokenData.error_description || 'Erreur lors de l\'échange du code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les informations de l'utilisateur
    const userInfoResponse = await fetch(`${GOOGLE_USERINFO_URL}?alt=json&access_token=${tokenData.access_token}`);
    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error('Erreur lors de la récupération des informations utilisateur:', userInfo);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération des informations utilisateur' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Informations utilisateur récupérées pour ${userInfo.email}`);

    // Stocker les tokens dans la base de données
    const now = new Date();
    const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);

    // Stocker dans la table oauth_tokens
    const { error: tokenError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        provider_user_id: userInfo.id,
        provider_user_info: userInfo,
        scopes: GOOGLE_SCOPES,
      }, { onConflict: 'user_id,provider' });

    if (tokenError) {
      console.error('Erreur lors du stockage des tokens:', tokenError);
    }

    // Stocker également dans la table service_configurations
    const { error: configError } = await supabase
      .from('service_configurations')
      .upsert({
        user_id: userId,
        service_type: 'GOOGLE_OAUTH',
        status: 'configured',
        configuration: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          expires_at: expiresAt.toISOString(),
        },
      }, { onConflict: 'user_id,service_type' });

    if (configError) {
      console.error('Erreur lors du stockage de la configuration:', configError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_info: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de l\'échange du code:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de l\'échange du code' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour révoquer le token d'accès
async function handleRevokeToken(userId: string) {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'ID utilisateur requis' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`Révocation du token pour l'utilisateur ${userId}`);

    // Récupérer le token d'accès
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData?.access_token) {
      return new Response(
        JSON.stringify({ error: 'Token non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Révoquer le token
    const revokeResponse = await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: tokenData.access_token,
        client_id: googleClientId,
        client_secret: googleClientSecret,
      }).toString(),
    });

    if (!revokeResponse.ok) {
      const revokeData = await revokeResponse.json();
      console.error('Erreur lors de la révocation du token:', revokeData);
    }

    // Supprimer les tokens de la base de données
    const { error: deleteTokenError } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google');

    if (deleteTokenError) {
      console.error('Erreur lors de la suppression des tokens:', deleteTokenError);
    }

    // Mettre à jour le statut de la configuration
    const { error: updateConfigError } = await supabase
      .from('service_configurations')
      .update({ status: 'not_configured' })
      .eq('user_id', userId)
      .eq('service_type', 'GOOGLE_OAUTH');

    if (updateConfigError) {
      console.error('Erreur lors de la mise à jour de la configuration:', updateConfigError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la révocation du token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de la révocation du token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour vérifier le statut du token
async function handleCheckTokenStatus(userId: string) {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'ID utilisateur requis' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`Vérification du statut du token pour l'utilisateur ${userId}`);

    // Récupérer les informations du token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('expires_at, access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ isValid: false, error: 'Token non trouvé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    const expiresIn = Math.round((expiresAt.getTime() - now.getTime()) / 1000);

    // Si le token expire dans moins de 5 minutes, le considérer comme invalide
    if (expiresIn < 300) {
      return new Response(
        JSON.stringify({ isValid: false, expiresIn, needsRefresh: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier la validité du token en faisant une requête à l'API Google
    const validateResponse = await fetch(`${GOOGLE_USERINFO_URL}?alt=json&access_token=${tokenData.access_token}`);
    
    if (!validateResponse.ok) {
      return new Response(
        JSON.stringify({ isValid: false, expiresIn, needsRefresh: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ isValid: true, expiresIn }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du token:', error);
    return new Response(
      JSON.stringify({ isValid: false, error: error.message || 'Erreur lors de la vérification du statut du token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour récupérer le token d'accès
async function handleGetToken(userId: string) {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'ID utilisateur requis' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`Récupération du token pour l'utilisateur ${userId}`);

    // Récupérer le token d'accès
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData?.access_token) {
      return new Response(
        JSON.stringify({ error: 'Token non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le token est expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now >= expiresAt) {
      // Le token est expiré, il faut le rafraîchir
      return new Response(
        JSON.stringify({ error: 'Token expiré, rafraîchissement nécessaire' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ access_token: tokenData.access_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de la récupération du token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fonction pour rafraîchir le token d'accès
async function handleRefreshToken(userId: string) {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'ID utilisateur requis' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`Rafraîchissement du token pour l'utilisateur ${userId}`);

    // Récupérer le refresh token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData?.refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Refresh token non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rafraîchir le token
    const refreshResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }).toString(),
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      console.error('Erreur lors du rafraîchissement du token:', refreshData);
      return new Response(
        JSON.stringify({ error: refreshData.error_description || 'Erreur lors du rafraîchissement du token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour le token dans la base de données
    const now = new Date();
    const expiresAt = new Date(now.getTime() + refreshData.expires_in * 1000);

    const { error: updateError } = await supabase
      .from('oauth_tokens')
      .update({
        access_token: refreshData.access_token,
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google');

    if (updateError) {
      console.error('Erreur lors de la mise à jour du token:', updateError);
    }

    // Mettre à jour également la configuration
    const { error: updateConfigError } = await supabase
      .from('service_configurations')
      .update({
        configuration: supabase.sql`jsonb_set(configuration, '{expires_at}', '"${expiresAt.toISOString()}"')`,
      })
      .eq('user_id', userId)
      .eq('service_type', 'GOOGLE_OAUTH');

    if (updateConfigError) {
      console.error('Erreur lors de la mise à jour de la configuration:', updateConfigError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: refreshData.access_token,
        expires_in: refreshData.expires_in,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors du rafraîchissement du token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
