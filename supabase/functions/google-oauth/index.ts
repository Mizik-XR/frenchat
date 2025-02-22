
import { serve } from "https://deno.fresh.dev/std@v1.0.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Google OAuth flow...');
    const { code } = await req.json();
    const userId = req.headers.get('x-user-id');

    if (!code || !userId) {
      throw new Error('Authorization code or user ID missing');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer la configuration Google OAuth
    const { data: configData, error: configError } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    if (configError || !configData?.config) {
      console.error('Configuration error:', configError);
      throw new Error('Google OAuth configuration not found');
    }

    console.log('Exchanging auth code for tokens...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
      console.error('Token exchange error:', tokens);
      throw new Error(tokens.error_description || 'Failed to exchange tokens');
    }

    console.log('Saving tokens to database...');
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
      console.error('Token storage error:', tokenError);
      throw new Error('Failed to save tokens');
    }

    // Mettre à jour le statut de la configuration
    await supabase
      .from('service_configurations')
      .upsert({
        service_type: 'google_drive',
        status: 'configured',
        oauth_connected: true,
        updated_at: new Date().toISOString()
      });

    console.log('Google OAuth flow completed successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Google OAuth flow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
