
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getRedirectUrl } from '@/utils/environmentUtils';
import { generateOAuthState } from '@/utils/oauthStateManager';

/**
 * Récupère l'URL de redirection pour l'authentification OAuth Google Drive
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
export const initiateGoogleAuth = async (userId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getGoogleRedirectUrl();
  console.log("URL de redirection configurée:", redirectUri);
  
  const { data: authData, error: authError } = await supabase.functions.invoke<{
    client_id: string;
  }>('google-oauth', {
    body: { 
      action: 'get_client_id',
      redirectUrl: redirectUri
    }
  });

  if (authError || !authData?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('google');

  // Demande de scopes étendus pour l'accès aux fichiers
  const scopes = encodeURIComponent(
    'https://www.googleapis.com/auth/drive.file ' +
    'https://www.googleapis.com/auth/drive.metadata.readonly ' +
    'https://www.googleapis.com/auth/userinfo.email ' +
    'https://www.googleapis.com/auth/userinfo.profile'
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
 * Révoque le token Google Drive et supprime les enregistrements locaux
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès de l'opération
 */
export const revokeGoogleDriveAccess = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  // Révoquer le token d'accès côté Google
  const { error: revokeError } = await supabase.functions.invoke('google-oauth', {
    body: { 
      action: 'revoke_token',
      userId: userId
    }
  });

  if (revokeError) {
    console.error("Erreur lors de la révocation du token:", revokeError);
    // On continue pour supprimer le token côté Supabase même si la révocation échoue chez Google
  }

  // Supprimer le token de la base de données
  const { error: deleteError } = await supabase
    .from('oauth_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('provider', 'google');

  if (deleteError) {
    throw new Error("Erreur lors de la suppression du token local");
  }
  
  return true;
};

/**
 * Tente de rafraîchir un token Google Drive expiré
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès du rafraîchissement
 */
export const refreshGoogleToken = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  const { data: refreshData, error: refreshError } = await supabase.functions.invoke('google-oauth', {
    body: { 
      action: 'refresh_token', 
      userId: userId,
      redirectUrl: getGoogleRedirectUrl()
    }
  });
  
  if (refreshError || !refreshData?.success) {
    console.error("Erreur lors du rafraîchissement du token:", refreshError || "Token non rafraîchi");
    return false;
  }
  
  console.log("Token rafraîchi avec succès");
  return true;
};
