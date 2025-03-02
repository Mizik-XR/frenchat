
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
  
  // Utilisation de la nouvelle fonction OAuth unifiée avec le paramètre 'provider'
  const { data: authData, error: authError } = await supabase.functions.invoke<{
    client_id: string;
  }>('unified-oauth', {
    body: { 
      provider: 'google',  // Spécifier le fournisseur
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

  // Appel sécurisé à l'Edge Function unifiée pour révoquer le token sans l'exposer côté client
  const { error: revokeError } = await supabase.functions.invoke('unified-oauth', {
    body: { 
      provider: 'google',  // Spécifier le fournisseur
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
 * Vérifie l'état du token Google Drive et le rafraîchit si nécessaire
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant si le token est valide
 */
export const checkGoogleTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    const { data, error } = await supabase.functions.invoke('unified-oauth', {
      body: { 
        provider: 'google',  // Spécifier le fournisseur
        action: 'check_token_status', 
        userId: userId
      }
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
export const refreshGoogleToken = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data: refreshData, error: refreshError } = await supabase.functions.invoke('unified-oauth', {
      body: { 
        provider: 'google',  // Spécifier le fournisseur
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
  } catch (e) {
    console.error("Exception lors du rafraîchissement du token:", e);
    return false;
  }
};
