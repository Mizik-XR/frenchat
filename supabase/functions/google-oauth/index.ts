
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const userId = req.headers.get('x-user-id');
    const origin = req.headers.get('origin');

    if (!code) {
      console.error('Code d\'autorisation manquant');
      return new Response(
        JSON.stringify({ error: 'Code d\'autorisation manquant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      console.error('User ID manquant');
      return new Response(
        JSON.stringify({ error: 'User ID manquant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Utilisation des secrets pour les identifiants OAuth
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Identifiants OAuth manquants dans les variables d\'environnement');
      return new Response(
        JSON.stringify({ error: 'Configuration OAuth incomplète' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const redirectUri = `${origin}/auth/callback/google`;
    console.log('Redirect URI:', redirectUri);

    console.log('Échange du code d\'autorisation...');
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
      console.error('Erreur lors de l\'échange du code:', tokens);
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de l\'échange du code d\'autorisation',
          details: tokens.error_description || tokens.error
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tokens obtenus avec succès');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    console.log('Sauvegarde des tokens...');
    const { error: saveError } = await supabaseClient
      .from('oauth_tokens')
      .upsert({
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
      console.error('Erreur lors de la sauvegarde des tokens:', saveError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde des tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Configuration OAuth terminée avec succès');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur inattendue lors du traitement de la requête',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
