import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionResponse } from '@/integrations/supabase/client';
import { getRedirectUrl } from '@/utils/environment/urlUtils';

/**
 * Récupère l'URL de redirection pour l'authentification OAuth Microsoft Teams
 * @returns L'URL complète de redirection pour Microsoft OAuth
 */
export const getMicrosoftRedirectUrl = (): string => {
  return getRedirectUrl('auth/microsoft/callback');
};

/**
 * Initie le processus d'authentification Microsoft Teams
 * @param userId L'ID de l'utilisateur actuel
 * @param tenantId ID du tenant Microsoft
 * @returns Promise avec l'URL d'authentification Microsoft
 */
export const initiateMicrosoftAuth = async (userId: string, tenantId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getMicrosoftRedirectUrl();
  console.log("URL de redirection configurée:", redirectUri);
  
  type ClientIdResponse = { client_id: string };
  
  const { data: authData, error: authError } = await supabase.functions.invoke('microsoft-oauth', {
    body: { 
      action: 'get_client_id',
      redirectUrl: redirectUri
    }
  }) as EdgeFunctionResponse<ClientIdResponse>;

  if (authError || !authData?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('microsoft');

  // Demande de scopes nécessaires pour Teams
  const scopes = encodeURIComponent(
    'user.read ' +
    'Files.Read.All ' +
    'Sites.Read.All ' +
    'ChannelMessage.Read.All ' +
    'offline_access'
  );
  
  const redirectUrl = encodeURIComponent(redirectUri);
  
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${authData.client_id}&` +
    `redirect_uri=${redirectUrl}&` +
    `response_type=code&` +
    `scope=${scopes}&` +
    `state=${encodeURIComponent(state)}&` +
    `prompt=consent`;

  return authUrl;
};

/**
 * Révoque le token Microsoft Teams et supprime les enregistrements locaux
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès de l'opération
 */
export const revokeMicrosoftTeamsAccess = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  // Appel sécurisé à l'Edge Function pour révoquer le token sans l'exposer côté client
  const { error: revokeError } = await supabase.functions.invoke('microsoft-oauth', {
    body: { 
      action: 'revoke_token',
      userId: userId
    }
  });

  if (revokeError) {
    console.error("Erreur lors de la révocation du token:", revokeError);
    throw new Error(`Erreur lors de la révocation: ${revokeError.message}`);
  }
  
  return true;
};

/**
 * Vérifie l'état du token Microsoft Teams et le rafraîchit si nécessaire
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant si le token est valide
 */
export const checkMicrosoftTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    type TokenStatusResponse = {isValid: boolean, expiresIn?: number};
    
    const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
      body: { 
        action: 'check_token_status', 
        userId: userId
      }
    }) as EdgeFunctionResponse<TokenStatusResponse>;
    
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
 * Tente de rafraîchir un token Microsoft Teams expiré
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès du rafraîchissement
 */
export const refreshMicrosoftToken = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    type RefreshResponse = {success: boolean};
    
    const { data: refreshData, error: refreshError } = await supabase.functions.invoke('microsoft-oauth', {
      body: { 
        action: 'refresh_token', 
        userId: userId,
        redirectUrl: getMicrosoftRedirectUrl()
      }
    }) as EdgeFunctionResponse<RefreshResponse>;
    
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

export async function getMicrosoftTeamsConfig(userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse<any>>('microsoft-oauth', {
      body: { action: 'get_config', userId }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error getting Microsoft Teams config:', error);
    return null;
  }
}
