
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { encryptToken, decryptToken } from './utils/encryption.ts';
import { 
  getStoredToken, 
  storeToken, 
  refreshAccessToken 
} from './services/tokenService.ts';
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  revokeToken,
  checkTokenStatus
} from './services/oauthService.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const googleClientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
const googleClientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
const tokenEncryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || '';

// Initialisation du client Supabase avec la clé de service pour les opérations administratives
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Point d'entrée principal de l'Edge Function
Deno.serve(async (req) => {
  // Gestion des requêtes CORS préliminaires
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Récupération et analyse du corps de la requête
    const requestData = await req.json();
    
    // Gestion des différentes actions
    if (requestData.action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: googleClientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'revoke_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await revokeToken(supabase, userId, tokenEncryptionKey);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'check_token_status') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const status = await checkTokenStatus(supabase, userId, tokenEncryptionKey);
      
      return new Response(
        JSON.stringify(status),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'refresh_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Récupérer le token actuel (déjà déchiffré par getStoredToken)
      const tokenData = await getStoredToken(supabase, userId, 'google', tokenEncryptionKey);
      
      if (!tokenData || !tokenData.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Aucun refresh token disponible" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const refreshResult = await refreshAccessToken(
        supabase, 
        userId, 
        tokenData.refresh_token, 
        googleClientId, 
        googleClientSecret,
        tokenEncryptionKey
      );
      
      return new Response(
        JSON.stringify({ success: true, ...refreshResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (requestData.action === 'get_token') {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "ID utilisateur requis" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const tokenData = await getStoredToken(supabase, userId, 'google', tokenEncryptionKey);
      
      if (!tokenData || !tokenData.access_token) {
        return new Response(
          JSON.stringify({ error: "Aucun token disponible" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ access_token: tokenData.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Traitement par défaut: échange du code d'autorisation
    const { code, redirectUrl, state } = requestData;
    
    if (!code || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Code d'autorisation et URL de redirection requis" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Échange du code contre des tokens
    const tokens = await exchangeCodeForTokens(code, redirectUrl, googleClientId, googleClientSecret);
    
    // Récupération des informations de l'utilisateur
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    
    // Récupération de l'ID utilisateur à partir du token JWT
    const authHeader = req.headers.get('Authorization');
    let userId;
    
    if (authHeader) {
      // Si l'utilisateur est authentifié, utiliser son ID
      const jwt = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(jwt);
      userId = user?.id;
    } else {
      // Sinon, rechercher l'utilisateur par email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', userInfo.email)
        .single();
      
      if (userError) {
        console.error("Erreur lors de la recherche de l'utilisateur:", userError);
        return new Response(
          JSON.stringify({ error: "Utilisateur non trouvé" }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = userData.id;
    }
    
    // Stockage des tokens chiffrés
    await storeToken(
      supabase,
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      userInfo,
      'google',
      tokenEncryptionKey
    );
    
    // Réponse finale avec les informations utilisateur (mais pas les tokens)
    return new Response(
      JSON.stringify({
        success: true,
        user_info: userInfo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erreur dans l'Edge Function Google OAuth:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Une erreur s'est produite lors de l'authentification Google Drive"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
