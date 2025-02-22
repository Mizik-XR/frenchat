
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'http://localhost:5173/auth/callback/google'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    const userId = req.headers.get('x-user-id')

    if (!code) {
      throw new Error('Code d\'autorisation manquant')
    }

    if (!userId) {
      throw new Error('User ID manquant')
    }

    console.log('Démarrage de l\'échange du code d\'autorisation...')

    // Récupération de la configuration Google OAuth
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: config, error: configError } = await supabaseAdmin
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single()

    if (configError || !config) {
      throw new Error('Configuration Google OAuth non trouvée')
    }

    const { client_id, client_secret } = config.config

    // Échange du code contre les tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id,
        client_secret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du code:', await tokenResponse.text())
      throw new Error('Échec de l\'échange du code d\'autorisation')
    }

    const tokens = await tokenResponse.json()
    console.log('Tokens reçus avec succès')

    // Stockage des tokens dans Supabase
    const { error: insertError } = await supabaseAdmin
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })

    if (insertError) {
      console.error('Erreur lors du stockage des tokens:', insertError)
      throw new Error('Échec du stockage des tokens')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur dans la fonction google-oauth:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
