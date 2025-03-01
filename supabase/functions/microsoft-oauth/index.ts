
// Microsoft OAuth Handler for FileChat
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types pour les requêtes
interface GetClientIdRequest {
  action: 'get_client_id'
  redirectUrl: string
}

interface ExchangeCodeRequest {
  action: 'exchange_code'
  code: string
  redirectUrl: string
}

interface RefreshTokenRequest {
  action: 'refresh_token'
  userId: string
}

interface RevokeTokenRequest {
  action: 'revoke_token'
  userId: string
}

type MicrosoftOAuthRequest = 
  | GetClientIdRequest
  | ExchangeCodeRequest
  | RefreshTokenRequest
  | RevokeTokenRequest

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialisation du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Récupération des secrets nécessaires
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')
    const tenantId = Deno.env.get('MICROSOFT_TENANT_ID') || 'common'
    
    if (!clientId || !clientSecret) {
      throw new Error('Les identifiants OAuth Microsoft ne sont pas configurés')
    }

    // Extraction du corps de la requête
    const requestData = await req.json() as MicrosoftOAuthRequest
    
    console.log(`Traitement de l'action Microsoft OAuth: ${requestData.action}`)

    // Traitement en fonction de l'action demandée
    switch (requestData.action) {
      case 'get_client_id':
        // Retourner simplement l'ID client pour l'initialisation OAuth
        console.log(`Client ID fourni, URL de redirection: ${requestData.redirectUrl}`)
        return new Response(
          JSON.stringify({ 
            client_id: clientId,
            tenant_id: tenantId
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      
      case 'exchange_code': {
        // Échanger le code d'autorisation contre des tokens
        const { code, redirectUrl } = requestData
        console.log(`Échange de code pour tokens avec redirection vers: ${redirectUrl}`)
        
        // Préparer les paramètres pour l'échange
        const tokenParams = new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUrl,
          grant_type: 'authorization_code'
        })
        
        // Faire la requête à l'API Microsoft
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenParams
        })
        
        const tokenData = await tokenResponse.json()
        
        if (!tokenResponse.ok) {
          console.error('Erreur lors de l\'échange de tokens:', tokenData)
          throw new Error(`Erreur d'échange de tokens: ${tokenData.error_description || tokenData.error}`)
        }
        
        // Récupérer les informations de l'utilisateur Microsoft
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        })
        
        const userInfo = await userInfoResponse.json()
        
        if (!userInfoResponse.ok) {
          console.error('Erreur lors de la récupération des infos utilisateur:', userInfo)
          throw new Error('Impossible de récupérer les informations utilisateur')
        }
        
        // Récupérer l'utilisateur Supabase actuel
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError || !session) {
          throw new Error('Utilisateur non authentifié')
        }
        
        const userId = session.user.id
        
        // Calculer la date d'expiration
        const expiresAt = new Date()
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in)
        
        // Stocker les tokens dans la base de données
        const { error: insertError } = await supabase
          .from('oauth_tokens')
          .upsert({
            user_id: userId,
            provider: 'microsoft',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt.toISOString(),
            metadata: {
              email: userInfo.mail || userInfo.userPrincipalName,
              name: userInfo.displayName,
              id: userInfo.id,
              scope: tokenData.scope
            }
          })
        
        if (insertError) {
          console.error('Erreur lors du stockage des tokens:', insertError)
          throw new Error('Impossible de stocker les informations d\'authentification')
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            email: userInfo.mail || userInfo.userPrincipalName
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
      
      case 'refresh_token': {
        // Rafraîchir un token expiré
        const { userId } = requestData
        console.log(`Rafraîchissement du token pour l'utilisateur: ${userId}`)
        
        // Récupérer le token de rafraîchissement
        const { data: tokenData, error: tokenError } = await supabase
          .from('oauth_tokens')
          .select('refresh_token')
          .eq('user_id', userId)
          .eq('provider', 'microsoft')
          .single()
        
        if (tokenError || !tokenData?.refresh_token) {
          console.error('Erreur lors de la récupération du refresh token:', tokenError)
          throw new Error('Refresh token introuvable')
        }
        
        // Préparer les paramètres pour le rafraîchissement
        const refreshParams = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token'
        })
        
        // Faire la requête à l'API Microsoft
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: refreshParams
        })
        
        const refreshedTokenData = await tokenResponse.json()
        
        if (!tokenResponse.ok) {
          console.error('Erreur lors du rafraîchissement de token:', refreshedTokenData)
          throw new Error(`Erreur de rafraîchissement de token: ${refreshedTokenData.error_description || refreshedTokenData.error}`)
        }
        
        // Calculer la nouvelle date d'expiration
        const expiresAt = new Date()
        expiresAt.setSeconds(expiresAt.getSeconds() + refreshedTokenData.expires_in)
        
        // Mettre à jour les tokens dans la base de données
        const { error: updateError } = await supabase
          .from('oauth_tokens')
          .update({
            access_token: refreshedTokenData.access_token,
            expires_at: expiresAt.toISOString(),
            ...(refreshedTokenData.refresh_token ? { refresh_token: refreshedTokenData.refresh_token } : {})
          })
          .eq('user_id', userId)
          .eq('provider', 'microsoft')
        
        if (updateError) {
          console.error('Erreur lors de la mise à jour des tokens:', updateError)
          throw new Error('Impossible de mettre à jour les informations d\'authentification')
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
      
      case 'revoke_token': {
        // Note: Microsoft n'a pas d'endpoint standard pour révoquer les tokens
        // Mais nous pouvons supprimer les tokens de notre base de données
        const { userId } = requestData
        console.log(`Suppression du token Microsoft pour l'utilisateur: ${userId}`)
        
        // Supprimer les tokens de la base de données
        const { error: deleteError } = await supabase
          .from('oauth_tokens')
          .delete()
          .eq('user_id', userId)
          .eq('provider', 'microsoft')
        
        if (deleteError) {
          console.error('Erreur lors de la suppression des tokens:', deleteError)
          throw new Error('Impossible de supprimer les informations d\'authentification')
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
      
      default:
        throw new Error(`Action non supportée: ${(requestData as any).action}`)
    }
  } catch (error) {
    console.error('Erreur dans la fonction microsoft-oauth:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite'
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
