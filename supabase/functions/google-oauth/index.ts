
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const REDIRECT_URI = `${SUPABASE_URL}/auth/callback/google`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  try {
    const { code } = await req.json();
    const userId = req.headers.get('x-user-id');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupération de la configuration OAuth
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

    const { client_id, client_secret } = configData.config;

    // Échange du code contre des tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du code:', tokens);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'échange du code' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sauvegarde des tokens
    const { error: tokenError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        metadata: {
          token_type: tokens.token_type,
          scope: tokens.scope,
        }
      });

    if (tokenError) {
      console.error('Erreur lors de la sauvegarde des tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde des tokens' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Erreur inattendue:', err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
