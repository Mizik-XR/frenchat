
import { supabase } from '@/integrations/supabase/client';
import type { EdgeFunctionResponse } from '@/integrations/supabase/client'; 
import { validateOAuthState, generateOAuthState, storeOAuthState } from '@/utils/oauthStateManager';

// Structure pour la réponse du callback Google
interface GoogleAuthResponse {
  code: string;
  state: string;
  scope: string;
}

// Fonction pour échanger le code d'autorisation contre un jeton d'accès
export const exchangeGoogleAuthCode = async (code: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: { 
        code,
        action: 'exchange_code' 
      }
    });

    if (error) {
      console.error('Erreur lors de l\'échange du code d\'autorisation Google:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception lors de l\'échange du code d\'autorisation Google:', error);
    return { success: false, error };
  }
};

// Fonction pour obtenir l'URL d'autorisation Google
export const getGoogleAuthUrl = async () => {
  try {
    // Générer et stocker l'état OAuth pour la sécurité
    const state = generateOAuthState();
    storeOAuthState('google', state);

    // Obtenir l'ID client à partir de l'Edge Function
    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: { action: 'get_client_id' }
    });

    if (error || !data) {
      console.error('Erreur lors de la récupération de l\'ID client Google:', error);
      return { success: false, error: error || 'Données non disponibles' };
    }

    // Construire l'URL de redirection
    const redirectUri = `${window.location.origin}/google-auth-callback`;
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly');
    
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&access_type=offline&prompt=consent&state=${state}`;
    
    return { success: true, authUrl };
  } catch (error) {
    console.error('Exception lors de la génération de l\'URL d\'autorisation Google:', error);
    return { success: false, error };
  }
};

// Fonction pour valider le callback Google OAuth
export function validateGoogleCallback(params: URLSearchParams) {
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  
  if (error) {
    return { valid: false, error };
  }
  
  if (!code || !state) {
    return { valid: false, error: 'Paramètres de callback incomplets' };
  }
  
  // Valider l'état OAuth pour la sécurité CSRF
  const stateValid = validateOAuthState('google', state);
  if (!stateValid) {
    return { valid: false, error: 'État OAuth non valide' };
  }
  
  return { valid: true, code, state };
}
