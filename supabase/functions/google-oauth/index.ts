
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from "https://deno.fresh.dev/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_OAUTH_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || ''
const GOOGLE_OAUTH_CLIENT_SECRET = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    const userId = url.searchParams.get('state') // On utilise state pour passer l'ID utilisateur

    if (error) {
      console.error('Erreur OAuth:', error)
      return new Response(
        JSON.stringify({ error: 'Autorisation refusée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: 'Code ou userId manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Échanger le code contre un token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: `${url.origin}/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du token:', tokenData)
      return new Response(
        JSON.stringify({ error: 'Échec de l\'authentification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Sauvegarder le token dans la base de données
    const { error: dbError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google_drive',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        metadata: {
          scope: tokenData.scope,
          token_type: tokenData.token_type
        }
      })

    if (dbError) {
      console.error('Erreur lors de la sauvegarde du token:', dbError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde des informations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Mettre à jour le statut de connexion dans service_configurations
    await supabase
      .from('service_configurations')
      .upsert({
        service_type: 'google_drive',
        user_id: userId,
        oauth_connected: true,
        config: {
          connected_at: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erreur inattendue:', err)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
