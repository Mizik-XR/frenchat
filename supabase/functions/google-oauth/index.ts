
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { code } = await req.json();

    if (!code) {
      throw new Error('Code d\'autorisation manquant');
    }

    // Configuration depuis la base de données
    const { data: configData } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    if (!configData?.config?.client_id || !configData?.config?.client_secret) {
      throw new Error('Configuration Google OAuth manquante');
    }

    // Échange du code contre des tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: configData.config.client_id,
        client_secret: configData.config.client_secret,
        redirect_uri: `${req.headers.get('origin')}/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error('Erreur lors de l\'échange du code : ' + tokens.error);
    }

    // Stockage des tokens
    const { error: tokenError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: req.headers.get('x-user-id'),
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      });

    if (tokenError) {
      throw new Error('Erreur lors du stockage des tokens');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur :', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
