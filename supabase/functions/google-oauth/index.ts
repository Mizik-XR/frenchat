
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Initialisation de la fonction google-oauth');

    const { code } = await req.json();
    const userId = req.headers.get('x-user-id');

    if (!code) {
      console.error('Code d\'autorisation manquant');
      throw new Error('Code d\'autorisation manquant');
    }

    if (!userId) {
      console.error('ID utilisateur manquant');
      throw new Error('ID utilisateur manquant');
    }

    console.log('Récupération de la configuration Google OAuth');
    // Configuration depuis la base de données
    const { data: configData, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    if (configError || !configData?.config) {
      console.error('Erreur configuration:', configError || 'Configuration manquante');
      throw new Error('Configuration Google OAuth manquante');
    }

    console.log('Configuration récupérée, échange du code...');
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
      console.error('Erreur tokens:', tokens.error);
      throw new Error(`Erreur lors de l'échange du code: ${tokens.error}`);
    }

    console.log('Tokens reçus, sauvegarde dans la base de données...');
    // Stockage des tokens
    const { error: tokenError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      });

    if (tokenError) {
      console.error('Erreur sauvegarde tokens:', tokenError);
      throw new Error('Erreur lors du stockage des tokens');
    }

    console.log('Configuration Google Drive terminée avec succès');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur globale:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
