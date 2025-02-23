
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

serve(async (req) => {
  console.log('🚀 Fonction Google OAuth démarrée');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('👍 Requête OPTIONS CORS reçue');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, action } = await req.json();
    
    // Gestion de la demande de client_id
    if (action === 'get_client_id') {
      console.log('📝 Demande de client_id reçue');
      const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
      if (!clientId) {
        console.error('❌ GOOGLE_OAUTH_CLIENT_ID manquant');
        throw new Error('Client ID non configuré');
      }
      console.log('✅ Client ID récupéré avec succès');
      return new Response(
        JSON.stringify({ client_id: clientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification des paramètres requis
    const userId = req.headers.get('x-user-id');
    if (!code) {
      console.error('❌ Code d\'autorisation manquant');
      throw new Error('Code d\'autorisation manquant');
    }

    if (!userId) {
      console.error('❌ User ID manquant');
      throw new Error('User ID manquant');
    }

    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('❌ Identifiants OAuth manquants', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
      throw new Error('Configuration OAuth incomplète');
    }

    const redirectUri = `${req.headers.get('origin')}/auth/callback/google`;
    console.log('🔄 Redirect URI:', redirectUri);

    console.log('🔄 Échange du code d\'autorisation...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('❌ Erreur lors de l\'échange du code:', {
        status: tokenResponse.status,
        error: tokens.error,
        error_description: tokens.error_description
      });
      throw new Error(tokens.error_description || tokens.error || 'Erreur lors de l\'échange du code');
    }

    console.log('✅ Tokens obtenus avec succès');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // D'abord, supprimons l'ancien token s'il existe
    console.log('🗑️ Suppression de l\'ancien token si existant...');
    await supabaseClient
      .from('oauth_tokens')
      .delete()
      .match({ user_id: userId, provider: 'google' });

    console.log('💾 Sauvegarde du nouveau token...');
    const { error: saveError } = await supabaseClient
      .from('oauth_tokens')
      .insert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        metadata: {
          token_type: tokens.token_type,
          scope: tokens.scope
        }
      });

    if (saveError) {
      console.error('❌ Erreur lors de la sauvegarde des tokens:', saveError);
      throw saveError;
    }

    console.log('✅ Configuration OAuth terminée avec succès');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inattendue',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
