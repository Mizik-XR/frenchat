
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Création du client Supabase avec les variables d'environnement
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Clés d'API pour Google OAuth
const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupération des données de la requête
    const { action, code, redirectUrl, userId } = await req.json();

    // Action: récupérer le client_id
    if (action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: clientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action: échanger le code d'autorisation
    if (action === 'exchange_code') {
      if (!code || !redirectUrl) {
        throw new Error("Code d'autorisation ou URL de redirection manquant");
      }

      // Préparation des paramètres d'échange du code
      const tokenParams = new URLSearchParams();
      tokenParams.append('client_id', clientId);
      tokenParams.append('client_secret', clientSecret);
      tokenParams.append('code', code);
      tokenParams.append('redirect_uri', redirectUrl);
      tokenParams.append('grant_type', 'authorization_code');

      // Échange du code contre un token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Erreur lors de l'échange du code:", errorText);
        throw new Error(`Erreur lors de l'échange du code: ${errorText}`);
      }

      // Récupération des données du token
      const tokenData = await tokenResponse.json();
      
      // Récupération des informations utilisateur
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error("Erreur lors de la récupération des informations utilisateur");
      }

      const userInfo = await userInfoResponse.json();
      
      // Calcul de la date d'expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
      
      // Récupérer l'utilisateur Supabase courant
      const { data: sessionData, error: sessionError } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '');
      
      if (sessionError) {
        throw new Error(`Erreur d'authentification: ${sessionError.message}`);
      }
      
      const currentUserId = sessionData.user?.id;
      
      // Stockage du token dans la base de données
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .upsert({
          provider: 'google',
          user_id: currentUserId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          metadata: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            created_at: new Date().toISOString()
          }
        });

      if (insertError) {
        throw new Error(`Erreur lors du stockage du token: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, email: userInfo.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action: vérifier l'état du token
    if (action === 'check_token_status') {
      if (!userId) {
        throw new Error("ID utilisateur manquant");
      }
      
      // Récupération du token depuis la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('oauth_tokens')
        .select('expires_at, access_token')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .maybeSingle();
      
      if (tokenError) {
        throw new Error(`Erreur lors de la récupération du token: ${tokenError.message}`);
      }
      
      if (!tokenData) {
        return new Response(
          JSON.stringify({ isValid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Vérification de la validité du token
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const isValid = expiresAt > now;
      
      // Calcul du temps restant en secondes
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      return new Response(
        JSON.stringify({ isValid, expiresIn }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action: rafraîchir le token
    if (action === 'refresh_token') {
      if (!userId) {
        throw new Error("ID utilisateur manquant");
      }
      
      // Récupération du refresh token depuis la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('oauth_tokens')
        .select('refresh_token, metadata')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .maybeSingle();
      
      if (tokenError) {
        throw new Error(`Erreur lors de la récupération du refresh token: ${tokenError.message}`);
      }
      
      if (!tokenData?.refresh_token) {
        throw new Error("Aucun refresh token trouvé");
      }
      
      // Préparation des paramètres pour rafraîchir le token
      const refreshParams = new URLSearchParams();
      refreshParams.append('client_id', clientId);
      refreshParams.append('client_secret', clientSecret);
      refreshParams.append('refresh_token', tokenData.refresh_token);
      refreshParams.append('grant_type', 'refresh_token');
      
      // Appel à l'API pour rafraîchir le token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: refreshParams.toString(),
      });
      
      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error("Erreur lors du rafraîchissement du token:", errorText);
        throw new Error(`Erreur lors du rafraîchissement du token: ${errorText}`);
      }
      
      // Récupération des nouvelles données du token
      const newTokenData = await refreshResponse.json();
      
      // Calcul de la nouvelle date d'expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + newTokenData.expires_in);
      
      // Mise à jour du token dans la base de données
      const { error: updateError } = await supabase
        .from('oauth_tokens')
        .update({
          access_token: newTokenData.access_token,
          expires_at: expiresAt.toISOString(),
          // Conserver le refresh token existant si le nouveau n'est pas fourni
          ...(newTokenData.refresh_token ? { refresh_token: newTokenData.refresh_token } : {})
        })
        .eq('user_id', userId)
        .eq('provider', 'google');
      
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du token: ${updateError.message}`);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action: révoquer le token
    if (action === 'revoke_token') {
      if (!userId) {
        throw new Error("ID utilisateur manquant");
      }
      
      // Récupération du token depuis la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('oauth_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .maybeSingle();
      
      if (tokenError) {
        throw new Error(`Erreur lors de la récupération du token: ${tokenError.message}`);
      }
      
      if (tokenData?.access_token) {
        // Révocation du token d'accès
        const revokeParams = new URLSearchParams();
        revokeParams.append('token', tokenData.access_token);
        
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: revokeParams.toString(),
        });
      }
      
      // Suppression du token de la base de données
      const { error: deleteError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google');
      
      if (deleteError) {
        throw new Error(`Erreur lors de la suppression du token: ${deleteError.message}`);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Action non reconnue
    return new Response(
      JSON.stringify({ error: 'Action non supportée' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Erreur dans la fonction Google OAuth:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
