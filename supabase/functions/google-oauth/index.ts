
import { serve } from "https://deno.fresh.runtime.dev";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'http://localhost:5173/auth/callback/google';

serve(async (req) => {
  try {
    const { code } = await req.json();
    const userId = req.headers.get('x-user-id');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code d\'autorisation manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupération de la configuration OAuth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: configData, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    if (configError || !configData?.config) {
      console.error('Erreur lors de la récupération de la configuration:', configError);
      return new Response(
        JSON.stringify({ error: 'Configuration OAuth non trouvée' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = configData.config;

    // Échange du code contre des tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du code:', tokens);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'échange du code d\'autorisation' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calcul de la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Sauvegarde des tokens
    const { error: saveError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString()
      });

    if (saveError) {
      console.error('Erreur lors de la sauvegarde des tokens:', saveError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde des tokens' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur inattendue lors du traitement de la requête' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
