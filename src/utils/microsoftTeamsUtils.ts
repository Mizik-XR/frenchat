
import { supabase } from '@/integrations/supabase/client';
import type { EdgeFunctionResponse } from '@/integrations/supabase/client';
import { generateOAuthState, storeOAuthState, validateOAuthState } from '@/utils/oauthStateManager';

// Structure pour la réponse du callback Microsoft
interface MicrosoftAuthResponse {
  code: string;
  state: string;
  session_state?: string;
}

// Fonction pour échanger le code d'autorisation contre un jeton d'accès
export const exchangeMicrosoftAuthCode = async (code: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
      body: { 
        code,
        action: 'exchange_code' 
      }
    });

    if (error) {
      console.error('Erreur lors de l\'échange du code d\'autorisation Microsoft:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception lors de l\'échange du code d\'autorisation Microsoft:', error);
    return { success: false, error };
  }
};

// Fonction pour obtenir l'URL d'autorisation Microsoft
export const getMicrosoftAuthUrl = async () => {
  try {
    // Générer et stocker l'état OAuth pour la sécurité
    const state = generateOAuthState();
    storeOAuthState('microsoft', state);

    // Obtenir les paramètres clients à partir de l'Edge Function
    const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
      body: { action: 'get_auth_params' }
    });

    if (error || !data) {
      console.error('Erreur lors de la récupération des paramètres Microsoft:', error);
      return { success: false, error: error || 'Données non disponibles' };
    }

    // Construire l'URL de redirection
    const redirectUri = `${window.location.origin}/microsoft-auth-callback`;
    const scopes = encodeURIComponent('Files.Read.All offline_access');
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`;
    
    return { success: true, authUrl };
  } catch (error) {
    console.error('Exception lors de la génération de l\'URL d\'autorisation Microsoft:', error);
    return { success: false, error };
  }
};

// Fonction pour valider le callback Microsoft OAuth
export function validateMicrosoftCallback(params: URLSearchParams) {
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');
  
  if (error) {
    return { valid: false, error, errorDescription };
  }
  
  if (!code || !state) {
    return { valid: false, error: 'Paramètres de callback incomplets' };
  }
  
  // Valider l'état OAuth pour la sécurité CSRF
  const stateValid = validateOAuthState('microsoft', state);
  if (!stateValid) {
    return { valid: false, error: 'État OAuth non valide' };
  }
  
  return { valid: true, code, state };
}
