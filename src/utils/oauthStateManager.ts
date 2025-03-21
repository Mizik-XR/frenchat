
/**
 * Gestionnaire d'état OAuth pour sécuriser les flux d'authentification
 */

// Génère un état aléatoire pour la demande OAuth
export const generateOAuthState = () => {
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Stocke l'état OAuth dans le stockage de session
export const storeOAuthState = (provider: string, state: string) => {
  sessionStorage.setItem(`oauth_state_${provider}`, state);
  sessionStorage.setItem(`oauth_state_time_${provider}`, Date.now().toString());
};

// Vérifie l'état OAuth retourné lors du callback
export const verifyOAuthState = (provider: string, returnedState: string) => {
  const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
  const stateTime = sessionStorage.getItem(`oauth_state_time_${provider}`);
  
  // Nettoyage après vérification
  sessionStorage.removeItem(`oauth_state_${provider}`);
  sessionStorage.removeItem(`oauth_state_time_${provider}`);
  
  // Vérifier si l'état est expiré (30 minutes)
  if (stateTime) {
    const expiryTime = parseInt(stateTime) + (30 * 60 * 1000); // 30 minutes
    if (Date.now() > expiryTime) {
      console.error('État OAuth expiré');
      return false;
    }
  }
  
  // Vérifier la correspondance des états
  if (!storedState || storedState !== returnedState) {
    console.error('État OAuth non valide');
    return false;
  }
  
  return true;
};

// Alias pour compatibilité avec le reste du code
export const validateOAuthState = verifyOAuthState;

// Prépare un flux d'authentification OAuth
export const prepareOAuthFlow = (provider: string, redirectUri: string) => {
  const state = generateOAuthState();
  storeOAuthState(provider, state);
  
  return {
    state,
    redirectUri
  };
};

export default {
  generateOAuthState,
  storeOAuthState,
  verifyOAuthState,
  validateOAuthState,
  prepareOAuthFlow
};
