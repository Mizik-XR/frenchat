
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getRedirectUrl } from '@/utils/environmentUtils';
import { generateOAuthState, validateOAuthState } from '@/utils/oauthStateManager';

/**
 * Récupère l'URL de redirection pour l'authentification OAuth Google
 * @returns L'URL complète de redirection pour Google OAuth
 */
export const getGoogleRedirectUrl = (): string => {
  return getRedirectUrl('auth/google/callback');
};

/**
 * Initie le processus d'authentification Google Drive
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise avec l'URL d'authentification Google
 */
export const initiateGoogleDriveAuth = async (userId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getGoogleRedirectUrl();
  console.log("URL de redirection configurée:", redirectUri);
  
  const { data: authData, error: authError } = await supabase.functions.invoke<{
    client_id: string;
  }>('unified-oauth-proxy', {
    body: { 
      action: 'get_client_id',
      redirectUrl: redirectUri
    },
    query: { service: 'google' }
  });

  if (authError || !authData?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('google');

  // Demande de scopes nécessaires pour Google Drive
  const scopes = encodeURIComponent(
    'https://www.googleapis.com/auth/userinfo.email ' +
    'https://www.googleapis.com/auth/userinfo.profile ' + 
    'https://www.googleapis.com/auth/drive.readonly ' +
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  );
  
  const redirectUrl = encodeURIComponent(redirectUri);
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${authData.client_id}&` +
    `redirect_uri=${redirectUrl}&` +
    `response_type=code&` +
    `scope=${scopes}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return authUrl;
};

/**
 * Échange le code d'autorisation contre des tokens d'accès
 * @param code Le code d'autorisation retourné par Google
 * @param state L'état OAuth retourné par Google
 * @returns Promise avec les informations utilisateur Google
 */
export const exchangeGoogleAuthCode = async (code: string, state: string): Promise<any> => {
  // Vérification de l'état OAuth
  if (!validateOAuthState('google', state)) {
    toast({
      title: "Erreur d'authentification",
      description: "Session OAuth expirée ou invalide. Veuillez réessayer.",
      variant: "destructive"
    });
    throw new Error("État OAuth invalide");
  }

  const redirectUrl = getGoogleRedirectUrl();
  
  const { data, error } = await supabase.functions.invoke('unified-oauth-proxy', {
    body: { 
      code, 
      redirectUrl,
      state
    },
    query: { service: 'google' }
  });
  
  if (error || !data?.success) {
    console.error("Erreur lors de l'échange du code:", error || data?.error);
    throw new Error("Échec de l'authentification Google Drive");
  }
  
  return data.user_info;
};

/**
 * Révoque le token Google Drive et supprime les enregistrements locaux
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès de l'opération
 */
export const revokeGoogleDriveAccess = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  // Appel sécurisé à l'Edge Function pour révoquer le token sans l'exposer côté client
  const { error: revokeError } = await supabase.functions.invoke('unified-oauth-proxy', {
    body: { 
      action: 'revoke_token',
      userId: userId
    },
    query: { service: 'google' }
  });

  if (revokeError) {
    console.error("Erreur lors de la révocation du token:", revokeError);
    throw new Error(`Erreur lors de la révocation: ${revokeError.message}`);
  }
  
  return true;
};

/**
 * Vérifie l'état du token Google Drive et le rafraîchit si nécessaire
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant si le token est valide
 */
export const checkGoogleDriveTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    const { data, error } = await supabase.functions.invoke('unified-oauth-proxy', {
      body: { 
        action: 'check_token_status', 
        userId: userId
      },
      query: { service: 'google' }
    });
    
    if (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return { isValid: false };
    }
    
    return data || { isValid: false };
  } catch (e) {
    console.error("Exception lors de la vérification du token:", e);
    return { isValid: false };
  }
};

/**
 * Tente de rafraîchir un token Google Drive expiré
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès du rafraîchissement
 */
export const refreshGoogleDriveToken = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data: refreshData, error: refreshError } = await supabase.functions.invoke('unified-oauth-proxy', {
      body: { 
        action: 'refresh_token', 
        userId: userId
      },
      query: { service: 'google' }
    });
    
    if (refreshError || !refreshData?.success) {
      console.error("Erreur lors du rafraîchissement du token:", refreshError || "Token non rafraîchi");
      return false;
    }
    
    console.log("Token rafraîchi avec succès");
    return true;
  } catch (e) {
    console.error("Exception lors du rafraîchissement du token:", e);
    return false;
  }
};
